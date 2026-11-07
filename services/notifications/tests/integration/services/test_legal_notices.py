import asyncio
import uuid
from datetime import UTC, date, datetime, timedelta

import pytest
from babel.dates import format_date
from fastapi import HTTPException
from testee_common.auth.auth import current_user
from testee_common.auth.user import User
from testee_common.events.notifications import EVERYONE, Recipient

from notifications.constants.legal_notices import ALREADY_ASKED, NOTHING_FAILED
from notifications.integrations.resend import EmailRefused
from notifications.main import app
from notifications.repositories import bulk_sends, notifications
from notifications.services import bulk, delivery, legal_notices
from tests.integration.factories import api
from tests.integration.transactions import transaction

# Far enough ahead to be noticed, and a version of its own in the shared database.
LATER = (datetime.now(UTC).date() + timedelta(days=30 + uuid.uuid4().int % 300)).isoformat()


async def large_resend_quota(redis):
    return {"RESEND_DAILY_LIMIT": 1_000_000}


@pytest.fixture
def terms(monkeypatch):
    """New terms from LATER; every account is two users and a guest candidate; delivery is
    recorded by its key."""
    ann, bob = f"u-{uuid.uuid4()}", f"u-{uuid.uuid4()}"
    sent = []

    async def user_ids(after, setting=None):
        return [ann, bob, "guest-1"]

    async def recipients(ids):
        return [
            {"user_id": one, "email": f"{one}@example.com", "language": "en", "preferences": {}}
            for one in ids
        ]

    async def transmit(email, key):
        sent.append((email.to, email.subject, key))

    async def no_wait(_seconds):
        return None

    monkeypatch.setitem(legal_notices.LEGAL_VERSIONS, "terms", LATER)
    monkeypatch.setattr("notifications.services.audiences.accounts.user_ids", user_ids)
    monkeypatch.setattr(bulk.accounts, "recipients", recipients)
    monkeypatch.setattr(delivery, "transmit", transmit)
    monkeypatch.setattr("notifications.services.bulk.sleep", no_wait)
    monkeypatch.setattr("testee_common.limits.limits.current_values", large_resend_quota)

    return ann, bob, sent


def as_user(uid: str) -> None:
    app.dependency_overrides[current_user] = lambda: User(
        uid=uid, email=f"{uid}@example.com", email_verified=True
    )


def test_a_notice_is_asked_once_goes_in_everyones_bell_and_emails_each_account_once(run, terms):
    ann, bob, sent = terms

    async def ask():
        try:
            await legal_notices.ask("terms", "sam")
        except HTTPException as refused:
            return refused.detail

        return None

    async def scenario():
        asked = await asyncio.gather(ask(), ask())
        send = await transaction(bulk_sends.get, "legal_terms", LATER)
        everyone = [
            item
            for item in await transaction(
                notifications.latest,
                [(Recipient.USER, ann)],
                100,
                datetime.now(UTC) - timedelta(days=1),
            )
            if item.kind == "legal_terms" and item.data.get("date") == LATER
        ]
        await bulk.send_bulk(datetime.now(UTC))
        await bulk.send_bulk(datetime.now(UTC))
        states = {item["document"]: item["state"] for item in await legal_notices.states()}

        as_user(bob)

        async with api() as client:
            banner = (await client.get("/me/legal-changes")).json()

        app.dependency_overrides.clear()

        return asked, send, everyone, states, banner

    asked, send, everyone, states, banner = run(scenario())
    mine = sorted(item for item in sent if item[2].startswith(f"bulk/{send.id}/"))

    assert sorted(asked, key=str) == [None, ALREADY_ASKED]
    assert [(item.recipient, item.recipient_id, item.link) for item in everyone] == [
        (Recipient.ALL, EVERYONE, "/terms")
    ]
    # Never the guest candidate, and once each however many runs.
    assert [(to, key) for to, _, key in mine] == sorted(
        [(f"{user}@example.com", f"bulk/{send.id}/{user}") for user in (ann, bob)]
    )
    # The day it applies, as English writes it.
    day = format_date(date.fromisoformat(LATER), "long", locale="en")
    assert all(day in subject for _, subject, _ in mine)
    assert states["terms"] == "sent"
    assert {"document": "terms", "version": LATER} in banner


def test_a_failed_email_shows_on_the_notice_alerts_and_can_be_sent_again(run, terms, monkeypatch):
    _, _, sent = terms
    working = delivery.transmit

    async def refused(email, key):
        raise EmailRefused("no")

    async def sent_to_one(email, key):
        if email.to.startswith(failing[0]):
            await refused(email, key)

        await working(email, key)

    failing = [terms[1]]
    alerts = []
    monkeypatch.setattr(delivery, "transmit", sent_to_one)
    monkeypatch.setattr(bulk.logger, "error", lambda text, *args: alerts.append(args))

    def state():
        return next(item for item in found[-1] if item["document"] == "terms")

    found = []

    async def scenario():
        await legal_notices.ask("terms", "sam")
        await bulk.send_bulk(datetime.now(UTC))
        found.append(await legal_notices.states())
        first = state()
        failing[0] = "nobody"
        await legal_notices.retry("terms")
        found.append(await legal_notices.states())
        reopened = state()
        await bulk.send_bulk(datetime.now(UTC))
        found.append(await legal_notices.states())

        with pytest.raises(HTTPException) as nothing:
            await legal_notices.retry("terms")

        return first, reopened, state(), nothing.value

    first, reopened, last, nothing = run(scenario())

    assert (first["state"], first["failed"]) == ("sent", 1)
    assert [failed for _, failed in alerts] == [1]
    assert (reopened["state"], reopened["failed"]) == ("sending", 0)
    assert (last["state"], last["failed"]) == ("sent", 0)
    assert sum(key.endswith(terms[1]) for _, _, key in sent) == 1
    assert (nothing.status_code, nothing.detail) == (409, NOTHING_FAILED)
