"""A company's currency with automatic top-up on: billing says what a change would do before it's
saved, then agrees the new price and tells the company in the same save, and charges in it."""

import uuid
from datetime import UTC, datetime
from types import SimpleNamespace

import pytest

from billing.constants.currencies import Currency
from billing.repositories import auto_top_up_prices, auto_top_ups
from billing.services import currencies as currencies_service

COMPANY_ID = str(uuid.uuid4())
COMPANY = f"/companies/{COMPANY_ID}"


def running(**fields):
    """A running automatic top-up, agreed at $45."""
    return SimpleNamespace(
        subscription_id="sub_1",
        product="topup_50",
        price=4500,
        price_currency="USD",
        next_price=None,
        next_price_from=None,
        **fields,
    )


@pytest.fixture
def top_up(monkeypatch):
    """Sets the company's automatic top-up (none until then); gives what a save agreed to and
    told, each kept in the save's transaction, which the integration tests check."""
    found = {"row": None, "agreed": [], "told": []}

    async def get(session, owner_type, owner_id):
        return found["row"]

    async def agree(session, owner_type, owner_id, price, currency):
        found["agreed"].append((price, currency))

    monkeypatch.setattr(auto_top_ups, "get", get)
    monkeypatch.setattr(auto_top_ups, "locked", get)
    monkeypatch.setattr(auto_top_up_prices, "agree", agree)
    monkeypatch.setattr(
        currencies_service, "tell", lambda session, notice: found["told"].append(notice)
    )

    return found


@pytest.mark.parametrize(
    ("row", "charges"),
    [
        # No automatic top-up: nothing to say.
        (None, None),
        # One waiting for its card charges nothing yet.
        (SimpleNamespace(subscription_id=None), None),
        # A running one, agreed at $45: chosen in euros, it charges the price list's €50 at once.
        (running(), 5000),
        # Paused, it charges nothing now, but the new price is what it charges once it's back.
        (running(paused_at=datetime.now(UTC)), 5000),
    ],
)
def test_a_company_changes_its_currency_and_hears_what_automatic_top_up_now_charges(
    client, editor, top_up, saved_currencies, row, charges
):
    top_up["row"] = row
    editor("ann")

    response = client.put(f"{COMPANY}/billing/currency", json={"currency": "EUR"})

    assert response.json() == {
        "currency": "EUR",
        "currencies": [currency.value for currency in Currency],
        "auto_top_up_price": charges,
    }
    assert saved_currencies == {("company", COMPANY_ID): "EUR"}
    assert top_up["agreed"] == ([(charges, "EUR")] if charges else [])
    assert [notice["data"] for notice in top_up["told"]] == (
        [{"price": 4500, "currency": "USD", "new_price": 5000, "new_currency": "EUR"}]
        if charges
        else []
    )


def test_saving_the_currency_it_has_changes_nothing_and_tells_nobody(
    client, editor, top_up, saved_currencies
):
    top_up["row"] = running()
    saved_currencies[("company", COMPANY_ID)] = "USD"
    editor("ann")

    response = client.put(f"{COMPANY}/billing/currency", json={"currency": "USD"})

    assert response.json()["auto_top_up_price"] is None
    assert (top_up["agreed"], top_up["told"]) == ([], [])


def test_a_currency_change_is_told_to_the_company_with_no_key_and_opens_its_billing(
    client, editor, top_up
):
    """No key: the notifications service stores one per event, so two changes are two notices."""
    top_up["row"] = running()
    editor("ann")

    client.put(f"{COMPANY}/billing/currency", json={"currency": "EUR"})

    [notice] = top_up["told"]
    assert "key" not in notice
    assert (notice["recipient"], notice["recipient_id"], notice["kind"], notice["link"]) == (
        "company",
        COMPANY_ID,
        "auto_top_up_price_change",
        f"/companies/{COMPANY_ID}/billing",
    )


@pytest.mark.parametrize(
    ("row", "saved", "asked", "answer"),
    [
        # Nothing to confirm: no automatic top-up, or one still waiting for its card.
        (None, "USD", "EUR", None),
        (SimpleNamespace(subscription_id=None), "USD", "EUR", None),
        # The currency it's already in.
        (running(), "USD", "USD", None),
        # Both amounts come from billing, each in its currency: the price agreed, then the list's.
        (
            running(),
            "USD",
            "EUR",
            {"price": 4500, "currency": "USD", "new_price": 5000, "new_currency": "EUR"},
        ),
        # Nothing saved yet: the US dollars it's been in.
        (
            running(),
            None,
            "GBP",
            {"price": 4500, "currency": "USD", "new_price": 4000, "new_currency": "GBP"},
        ),
        # Back from a currency whose price wasn't agreed: that currency's list price.
        (
            running(),
            "EUR",
            "USD",
            {"price": 5000, "currency": "EUR", "new_price": 4500, "new_currency": "USD"},
        ),
        # Paused: it still has a price to confirm.
        (
            running(paused_at=datetime.now(UTC)),
            "USD",
            "EUR",
            {"price": 4500, "currency": "USD", "new_price": 5000, "new_currency": "EUR"},
        ),
    ],
)
def test_billing_says_what_a_new_currency_would_change_and_saves_nothing(
    client, editor, top_up, saved_currencies, row, saved, asked, answer
):
    top_up["row"] = row

    if saved:
        saved_currencies[("company", COMPANY_ID)] = saved

    before = dict(saved_currencies)
    editor("ann")

    response = client.get(f"{COMPANY}/billing/currency/change", params={"currency": asked})

    assert response.json() == answer
    assert saved_currencies == before
    assert (top_up["agreed"], top_up["told"]) == ([], [])


def test_a_currency_billing_doesnt_sell_in_isnt_asked_about(client, editor, top_up):
    editor("ann")

    response = client.get(f"{COMPANY}/billing/currency/change", params={"currency": "XYZ"})

    assert response.status_code == 422


@pytest.mark.parametrize(
    ("subscription", "company", "switched", "charged"),
    [
        # Set up in dollars, the company now in euros: switched over, then charged €50.
        ("USD", "EUR", ["EUR"], ("5000", "EUR")),
        # Already in the company's: charged as it is.
        ("GBP", "GBP", [], ("4000", "GBP")),
        # From before currencies (none recorded) and none saved: dollars as before.
        (None, None, [], ("5000", "USD")),
    ],
)
def test_an_automatic_top_up_charges_in_the_companys_currency(
    monkeypatch, saved_currencies, subscription, company, switched, charged
):
    import asyncio

    from billing.integrations import paddle
    from billing.services import auto_top_up_charging as service

    if company:
        saved_currencies[("company", "acme")] = company

    row = SimpleNamespace(
        subscription_id="sub_1",
        product="topup_50",
        currency=subscription,
        price=None,
        price_currency=None,
        language=None,
    )
    patched, recorded, items = [], [], []

    async def set_currency(subscription_id, currency):
        patched.append(currency)

    async def record(session, subscription_id, currency):
        recorded.append(currency)

    async def charge(subscription_id, price):
        items.append((price["unit_price"]["amount"], price["unit_price"]["currency_code"]))

    monkeypatch.setattr(paddle, "set_currency", set_currency)
    monkeypatch.setattr(paddle, "charge", charge)
    monkeypatch.setattr(auto_top_ups, "set_currency", record)

    asyncio.run(service.charge(row, "acme", datetime.now(UTC)))

    assert patched == recorded == switched
    assert items == [charged]
