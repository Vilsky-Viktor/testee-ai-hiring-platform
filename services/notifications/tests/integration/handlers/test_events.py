import uuid
from datetime import UTC, datetime, timedelta

import pytest
from event_pushes import push
from sqlalchemy import func, select, update
from testee_common.events.notifications import (
    NOTIFICATION_REQUESTED,
    NotificationKind,
    notification,
)

from notifications.constants.notifications import GROUP_HOURS
from notifications.core.db import Session
from notifications.integrations import accounts, companies
from notifications.models.notifications import Notification, Received
from notifications.services import delivery, notices
from tests.integration.factories import api, company, finished


async def rows(company_id: str) -> list[Notification]:
    async with Session() as session:
        found = await session.scalars(
            select(Notification)
            .where(Notification.recipient_id == company_id)
            .order_by(Notification.created_at)
        )

        return list(found)


def test_a_redelivered_event_makes_one_notification(run):
    company_id = company()
    event = notification("company", company_id, NotificationKind.INTERVIEW_READY, "/x", title="T")

    async def scenario():
        async with api() as client:
            # Pub/Sub's own retry (same message id), then the outbox re-sending it (a new
            # message id, the same outbox id).
            answers = [
                await client.post("/internal/events", json=push(*args))
                for args in [
                    (NOTIFICATION_REQUESTED, event, "outbox-1", "m-1"),
                    (NOTIFICATION_REQUESTED, event, "outbox-1", "m-1"),
                    (NOTIFICATION_REQUESTED, event, "outbox-1", "m-2"),
                ]
            ]

        async with Session() as session:
            received = await session.scalar(
                select(func.count()).select_from(Received).where(Received.event_id == "outbox-1")
            )

        return [answer.status_code for answer in answers], received, await rows(company_id)

    codes, received, saved = run(scenario())

    assert codes == [204, 204, 204]
    assert received == 1
    assert [row.event_id for row in saved] == ["outbox-1"]


@pytest.mark.parametrize(
    "kind", [NotificationKind.REFUND_APPROVED, NotificationKind.REFUND_REJECTED]
)
def test_a_refund_redelivered_or_sent_again_makes_one_notification_naming_the_company(
    run, monkeypatch, kind
):
    company_id = company()

    async def members(company_ids):
        return [{"id": company_id, "name": "Arcolabs", "members": []}]

    monkeypatch.setattr(companies, "members", members)
    event = notification(
        "company",
        company_id,
        kind,
        f"/companies/{company_id}/billing",
        key="adj_1",
        credits=5_000,
        price=5_550,
        currency="USD",
    )

    async def scenario():
        async with api() as client:
            for args in (
                (NOTIFICATION_REQUESTED, event, "outbox-r1", "m-1"),
                (NOTIFICATION_REQUESTED, event, "outbox-r1", "m-1"),
                (NOTIFICATION_REQUESTED, event, "outbox-r2", "m-2"),
            ):
                assert (await client.post("/internal/events", json=push(*args))).status_code == 204

        return await rows(company_id)

    [saved] = run(scenario())

    assert saved.data == {"credits": 5_000, "price": 5_550, "currency": "USD", "name": "Arcolabs"}


def test_a_currency_change_redelivered_is_one_notice_and_each_change_its_own(run, monkeypatch):
    """It has no key, so the event's id keeps it to one notification and one email each."""
    company_id = company()
    sent = []

    async def members(company_ids):
        return [
            {
                "id": company_id,
                "name": "Arcolabs",
                "members": [{"user_id": "ann", "editor": True}],
            }
        ]

    async def recipients(user_ids):
        return [{"user_id": "ann", "email": "ann@example.com", "language": "en"}]

    async def send(email, key):
        sent.append((key, email.text))

    monkeypatch.setattr(companies, "members", members)
    monkeypatch.setattr(accounts, "recipients", recipients)
    monkeypatch.setattr(delivery, "send", send)
    link = f"/companies/{company_id}/billing"
    there = notification(
        "company",
        company_id,
        NotificationKind.AUTO_TOP_UP_PRICE_CHANGE,
        link,
        price=4500,
        currency="USD",
        new_price=4000,
        new_currency="GBP",
    )
    back = notification(
        "company",
        company_id,
        NotificationKind.AUTO_TOP_UP_PRICE_CHANGE,
        link,
        price=4000,
        currency="GBP",
        new_price=5000,
        new_currency="USD",
    )

    async def scenario():
        async with api() as client:
            for args in (
                (NOTIFICATION_REQUESTED, there, "outbox-c1", "m-1"),
                (NOTIFICATION_REQUESTED, there, "outbox-c1", "m-1"),
                (NOTIFICATION_REQUESTED, there, "outbox-c1", "m-2"),
                (NOTIFICATION_REQUESTED, back, "outbox-c2", "m-3"),
            ):
                assert (await client.post("/internal/events", json=push(*args))).status_code == 204

        return await rows(company_id)

    saved = run(scenario())

    assert [(row.event_id, row.data["new_currency"]) for row in saved] == [
        ("outbox-c1", "GBP"),
        ("outbox-c2", "USD"),
    ]
    assert {row.data["name"] for row in saved} == {"Arcolabs"}
    # A redelivered one sends with the same key, which the sending side sends once.
    assert {key for key, _ in sent} == {"events/outbox-c1/ann", "events/outbox-c2/ann"}
    assert all("$45" in text and "£40" in text for key, text in sent if "c1" in key)


def test_the_same_key_from_different_events_makes_one_notification(run):
    company_id = company()
    event = notification(
        "company", company_id, NotificationKind.INTERVIEW_READY, "/x", key="invite-1", title="T"
    )

    async def scenario():
        async with api() as client:
            answers = [
                await client.post(
                    "/internal/events",
                    json=push(NOTIFICATION_REQUESTED, event, str(uuid.uuid4()), message_id),
                )
                for message_id in ["m-k1", "m-k2"]
            ]

        return [answer.status_code for answer in answers], await rows(company_id)

    codes, saved = run(scenario())

    assert codes == [204, 204]
    assert [row.event_id for row in saved] == ["interview_ready:invite-1"]


def test_candidates_finishing_one_test_add_up_in_one_notification(run):
    company_id = company()

    async def scenario():
        for email in ["a@x.com", "b@x.com", "c@x.com"]:
            await notices.store(str(uuid.uuid4()), finished(company_id, email=email))

        # A retried event of the group doesn't count twice.
        await notices.store("retried", finished(company_id, email="d@x.com"))
        await notices.store("retried", finished(company_id, email="d@x.com"))

        return await rows(company_id)

    [group] = run(scenario())

    assert group.data == {"title": "Backend", "email": "d@x.com", "count": 4}


def test_another_test_or_an_ungrouped_kind_makes_its_own_notification(run):
    company_id = company()
    ready = notification("company", company_id, NotificationKind.INTERVIEW_READY, "/x", title="T")

    async def scenario():
        await notices.store(str(uuid.uuid4()), finished(company_id, "Backend"))
        await notices.store(str(uuid.uuid4()), finished(company_id, "Frontend"))
        await notices.store(str(uuid.uuid4()), ready)
        await notices.store(str(uuid.uuid4()), ready)

        return await rows(company_id)

    saved = run(scenario())

    assert sorted((row.kind, row.data.get("title"), row.data.get("count")) for row in saved) == [
        ("candidate_finished", "Backend", None),
        ("candidate_finished", "Frontend", None),
        ("interview_ready", "T", None),
        ("interview_ready", "T", None),
    ]


def test_a_group_older_than_the_window_starts_a_new_one(run):
    company_id = company()

    async def scenario():
        await notices.store(str(uuid.uuid4()), finished(company_id))

        async with Session() as session:
            await session.execute(
                update(Notification)
                .where(Notification.recipient_id == company_id)
                .values(created_at=datetime.now(UTC) - timedelta(hours=GROUP_HOURS + 1))
            )
            await session.commit()

        await notices.store(str(uuid.uuid4()), finished(company_id))
        await notices.store(str(uuid.uuid4()), finished(company_id))

        return await rows(company_id)

    old, new = run(scenario())

    assert "count" not in old.data
    assert new.data["count"] == 2
