"""A refund Paddle decided: the bell, Slack and the emails all say which company it's about and
how much, in the buyer's currency and the recipient's language, and a company that's gone gets
nothing."""

import asyncio

import pytest
from testee_common.events.notifications import notification

from notifications.config import settings
from notifications.integrations import accounts, companies
from notifications.services import delivery, events, notices, service_emails, slack

COMPANY = {
    "id": "c1",
    "name": "Arcolabs",
    "members": [{"user_id": "ann", "editor": True}, {"user_id": "vic", "editor": False}],
}
REFUND = {"credits": 5_000, "price": 5_550, "currency": "USD"}
KINDS = ["refund_approved", "refund_rejected"]


@pytest.fixture
def world(monkeypatch):
    """Companies, accounts and delivery faked: what was stored and emailed. `language` is the
    recipient's, `found` the companies that exist."""
    state = {"stored": {}, "emails": [], "posted": [], "language": "en", "found": [COMPANY]}

    async def members(company_ids):
        return state["found"]

    async def recipients(user_ids):
        return [
            {"user_id": uid, "email": f"{uid}@example.com", "language": state["language"]}
            for uid in user_ids
        ]

    async def send(email, key):
        state["emails"].append((key, email.subject, email.text))

    async def store(key, data):
        new = key not in state["stored"]
        state["stored"].setdefault(key, data)

        return new

    async def announce(recipient, recipient_id):
        return None

    async def deliver(data, key):
        state["posted"].append((key, data))

    monkeypatch.setattr(companies, "members", members)
    monkeypatch.setattr(accounts, "recipients", recipients)
    monkeypatch.setattr(delivery, "send", send)
    monkeypatch.setattr(notices, "store", store)
    monkeypatch.setattr(events, "announce", announce)
    monkeypatch.setattr(slack, "deliver", deliver)
    monkeypatch.setattr(settings, "site_url", "https://testee.ai")

    return state


def refund_event(kind: str) -> dict:
    return notification("company", "c1", kind, "/companies/c1/billing", key="adj_1", **REFUND)


@pytest.mark.parametrize("kind", KINDS)
def test_the_bell_and_slack_get_the_companys_name(world, kind):
    asyncio.run(events.notify(refund_event(kind), "event-1"))

    [(key, stored)] = world["stored"].items()
    assert key == f"{kind}:adj_1"
    assert stored["data"] == {**REFUND, "name": "Arcolabs"}
    assert world["posted"][0][1]["data"]["name"] == "Arcolabs"


@pytest.mark.parametrize(
    ("kind", "subject"),
    [
        ("refund_approved", "Refund approved for Arcolabs: $55.50"),
        ("refund_rejected", "Refund declined for Arcolabs: $55.50"),
    ],
)
def test_each_editor_gets_one_email_naming_the_company_and_amount(world, kind, subject):
    asyncio.run(events.notify(refund_event(kind), "event-1"))

    [(key, sent, text)] = world["emails"]
    assert key == f"events/{kind}:adj_1/ann"
    assert sent == subject
    assert "$55.50" in text
    assert "https://testee.ai/companies/c1/billing" in text


@pytest.mark.parametrize("kind", KINDS)
def test_a_redelivered_refund_is_stored_once_and_sent_under_the_same_keys(world, kind):
    for attempt in ("event-1", "event-2"):
        asyncio.run(events.notify(refund_event(kind), attempt))

    assert len(world["stored"]) == 1
    assert {key for key, _ in world["posted"]} == {f"{kind}:adj_1"}
    assert {key for key, _, _ in world["emails"]} == {f"events/{kind}:adj_1/ann"}


@pytest.mark.parametrize(
    ("language", "shown"),
    [("de", "55,50\u00a0$"), ("ja", "$55.50")],
)
@pytest.mark.parametrize("kind", KINDS)
def test_the_email_is_in_the_recipients_language_and_forms(world, kind, language, shown):
    world["language"] = language

    asyncio.run(events.notify(refund_event(kind), "event-1"))

    [(_, subject, text)] = world["emails"]
    assert "Arcolabs" in subject
    assert shown in text
    assert "plural" not in text


@pytest.mark.parametrize("kind", KINDS)
def test_a_company_that_is_gone_gets_nothing(world, kind):
    world["found"] = []

    asyncio.run(events.notify(refund_event(kind), "event-1"))

    assert world["stored"] == {}
    assert world["emails"] == []
    assert world["posted"] == []


def test_another_notice_isnt_looked_up(world):
    world["found"] = []
    event = notification("company", "c1", "interview_ready", "/x", title="T")

    assert asyncio.run(service_emails.named(event)) == event
