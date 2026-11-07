"""An automatic top-up turned on, charged, failed, paused or costing a new price is emailed to the
company's owners and admins, whatever their email settings; nothing else is, and nobody else gets
it. The ones turned on and charged say what it charges, in the recipient's language."""

import asyncio

import pytest
from testee_common.events.notifications import notification

from notifications.config import settings
from notifications.helpers.member_emails import top_up_unconfirmed_email
from notifications.integrations import accounts, companies
from notifications.services import delivery, service_emails
from notifications.templates.emails import EMAILS

COMPANY = {
    "id": "c1",
    "name": "Acme",
    "members": [{"user_id": "ann", "editor": True}, {"user_id": "vic", "editor": False}],
}
NOTICE = {"price": 4500, "new_price": 5000, "currency": "USD", "date": "2026-11-21"}
CURRENCY = {"price": 4500, "currency": "USD", "new_price": 4000, "new_currency": "GBP"}
TURNED_ON = {"price": 5000, "currency": "EUR", "threshold": 1500}
CHARGED = {
    "credits": 5000,
    "price": 5450,
    "currency": "USD",
    "date": "2026-10-29",
    "available": 5320,
}


@pytest.fixture
def sent(monkeypatch):
    """What was sent, by key; the recipients asked for."""
    found = {"sent": [], "asked": []}

    async def members(company_ids):
        return [COMPANY]

    async def recipients(user_ids):
        found["asked"].append(user_ids)

        return [
            {"user_id": uid, "email": f"{uid}@example.com", "language": "en"} for uid in user_ids
        ]

    async def send(email, key):
        found["sent"].append((key, email.subject, email.text))

    monkeypatch.setattr(companies, "members", members)
    monkeypatch.setattr(accounts, "recipients", recipients)
    monkeypatch.setattr(delivery, "send", send)
    monkeypatch.setattr(settings, "site_url", "https://testee.ai")

    return found


@pytest.mark.parametrize(
    ("kind", "data", "opens"),
    [
        ("auto_top_up_failed", {}, "https://testee.ai/top-up"),
        ("auto_top_up_failed", {"reason": "unconfirmed"}, "https://testee.ai/companies/c1/billing"),
        ("auto_top_up_paused", {}, "https://testee.ai/companies/c1/billing"),
        ("auto_top_up_price_change", NOTICE, "https://testee.ai/companies/c1/billing"),
        ("auto_top_up_price_change", CURRENCY, "https://testee.ai/companies/c1/billing"),
        ("auto_top_up_on", TURNED_ON, "https://testee.ai/companies/c1/billing"),
        ("auto_top_up_charged", CHARGED, "https://testee.ai/companies/c1/billing"),
    ],
)
def test_each_billing_notice_is_emailed_once_to_each_owner_and_admin(sent, kind, data, opens):
    event = notification("company", "c1", kind, "/companies/c1/billing", **data)

    asyncio.run(service_emails.billing_emails(event, "k1"))

    assert sent["asked"] == [["ann"]]
    [(key, subject, text)] = sent["sent"]
    assert key == "events/k1/ann"
    assert "Acme" in subject
    assert opens in text


@pytest.mark.parametrize(
    "event",
    [
        notification("company", "c1", "member_joined", "/companies/c1/members"),
        notification("user", "ann", "auto_top_up_paused", "/companies/c1/billing"),
    ],
)
def test_other_notices_and_a_persons_own_arent_emailed(sent, event):
    asyncio.run(service_emails.billing_emails(event, "k1"))

    assert sent == {"sent": [], "asked": []}


@pytest.mark.parametrize(
    ("kind", "data", "language", "shown"),
    [
        ("auto_top_up_on", TURNED_ON, "en", ["€50", "1,500"]),
        ("auto_top_up_on", TURNED_ON, "de", ["50\u00a0€", "1.500"]),
        # A new currency: each amount in its own, and no day, as it applies at once.
        ("auto_top_up_price_change", CURRENCY, "en", ["$45", "£40"]),
        ("auto_top_up_price_change", CURRENCY, "de", ["45\u00a0$", "40\u00a0£"]),
        ("auto_top_up_charged", CHARGED, "en", ["$54.50", "5,000", "5,320", "October 29, 2026"]),
        (
            "auto_top_up_charged",
            CHARGED,
            "de",
            ["54,50\u00a0$", "5.000", "5.320", "29. Oktober 2026"],
        ),
    ],
)
def test_turned_on_and_each_charge_say_what_it_charges_in_the_recipients_language(
    sent, monkeypatch, kind, data, language, shown
):
    async def recipients(user_ids):
        return [{"user_id": "ann", "email": "ann@example.com", "language": language}]

    monkeypatch.setattr(accounts, "recipients", recipients)
    event = notification("company", "c1", kind, "/companies/c1/billing", **data)

    asyncio.run(service_emails.billing_emails(event, "k1"))

    [(_, _, text)] = sent["sent"]
    assert [value for value in shown if value not in text] == []


def test_each_change_of_currency_is_its_own_email_and_a_redelivered_one_the_same(sent):
    """No key: the event's id keeps a redelivered change to one email, and tells two apart."""
    event = notification(
        "company", "c1", "auto_top_up_price_change", "/companies/c1/billing", **CURRENCY
    )

    for event_id in ("outbox-1", "outbox-1", "outbox-2"):
        asyncio.run(service_emails.billing_emails(event, event_id))

    assert {key for key, _, _ in sent["sent"]} == {"events/outbox-1/ann", "events/outbox-2/ann"}


@pytest.mark.parametrize(
    ("kind", "data"), [("auto_top_up_price_change", NOTICE), ("auto_top_up_price_change", CURRENCY)]
)
def test_a_price_change_names_its_company_and_is_dropped_once_the_company_is_gone(
    sent, monkeypatch, kind, data
):
    event = notification("company", "c1", kind, "/companies/c1/billing", **data)

    named = asyncio.run(service_emails.named(event))

    async def gone(company_ids):
        return []

    monkeypatch.setattr(companies, "members", gone)

    assert named["data"] == {**data, "name": "Acme"}
    assert asyncio.run(service_emails.named(event)) is None


def test_a_redelivered_charge_notice_sends_with_the_same_key(sent):
    """Pub/Sub may deliver the notice again: the same key, which the sending side sends once."""
    event = notification(
        "company", "c1", "auto_top_up_charged", "/companies/c1/billing", key="txn_1", **CHARGED
    )

    for _ in range(2):
        asyncio.run(service_emails.billing_emails(event, event["key"]))

    assert {key for key, _, _ in sent["sent"]} == {"events/auto_top_up_charged:txn_1/ann"}


@pytest.mark.parametrize(
    ("language", "credits", "available", "shown"),
    [
        ("en", 1, 1, ["added 1 credit.", "now has 1 credit available"]),
        ("en", 5000, 21, ["added 5,000 credits.", "now has 21 credits available"]),
        # Each language's own forms: Russian one, few and many; Arabic two and few.
        ("ru", 3, 5, ["3 кредита", "5 доступных кредитов"]),
        ("ru", 21, 1, ["21 кредит", "1 доступный кредит"]),
        ("ar", 2, 3, ["3 أرصدة متاحة"]),
    ],
)
def test_a_charges_credits_take_the_plural_their_number_needs(
    sent, monkeypatch, language, credits, available, shown
):
    async def recipients(user_ids):
        return [{"user_id": "ann", "email": "ann@example.com", "language": language}]

    monkeypatch.setattr(accounts, "recipients", recipients)
    data = {**CHARGED, "credits": credits, "available": available}
    event = notification("company", "c1", "auto_top_up_charged", "/companies/c1/billing", **data)

    asyncio.run(service_emails.billing_emails(event, "k1"))

    [(_, _, text)] = sent["sent"]
    assert [value for value in shown if value not in text] == []
    assert "plural" not in text


@pytest.mark.parametrize("language", EMAILS)
def test_a_top_up_that_isnt_confirmed_has_its_own_email_in_each_language(language):
    person = {"user_id": "ann", "email": "ann@example.com", "language": language}
    email = top_up_unconfirmed_email(person, "Acme", "https://testee.ai/top-up")

    assert email.subject == EMAILS[language]["top_up_unconfirmed"]["subject"].format(company="Acme")
    assert "https://testee.ai/top-up" in email.text
