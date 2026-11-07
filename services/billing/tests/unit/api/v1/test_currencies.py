"""Which currency prices are in: a company's billing in the company's, elsewhere the signed-in
person's, signed out the visitor's country's. A company's or a person's is saved from the first
known country billing sees them with; without a country (calls from AI apps, the public API,
other services, tests) the saved one applies, or US dollars, and nothing is saved."""

import uuid

import pytest

from billing.constants.currencies import Currency
from billing.repositories import auto_top_ups
from tests.unit.api.v1.test_internal import fresh_auth

COMPANY_ID = str(uuid.uuid4())
COMPANY = f"/companies/{COMPANY_ID}"


@pytest.fixture
def no_auto_top_up(monkeypatch):
    async def none(session, owner_type, owner_id):
        return None

    monkeypatch.setattr(auto_top_ups, "get", none)


@pytest.mark.parametrize(
    ("saved", "country", "shown", "kept"),
    [
        # Nothing saved and no country: US dollars, nothing saved.
        (None, None, "USD", None),
        (None, "XX", "USD", None),
        # Nothing saved yet: the country's, saved from now on.
        (None, "GB", "GBP", "GBP"),
        # Saved: kept, wherever the person is, with a country or without.
        ("EUR", None, "EUR", "EUR"),
        ("EUR", "US", "EUR", "EUR"),
    ],
)
def test_a_signed_in_persons_prices_are_in_their_saved_currency(
    client, signed_in, saved_currencies, saved, country, shown, kept
):
    if saved:
        saved_currencies[("user", "bob@example.com")] = saved

    signed_in("bob@example.com")
    params = {"country": country} if country else {}

    catalog = client.get("/catalog", params=params).json()
    assert catalog["currency"] == shown
    # Every currency it sells in, whichever is shown, for the landing's count.
    assert catalog["currencies"] == [currency.value for currency in Currency]
    assert client.get("/me/currency", params=params).json() == {
        "currency": shown,
        "currencies": [currency.value for currency in Currency],
    }
    assert saved_currencies.get(("user", "bob@example.com")) == kept


def test_a_person_changes_their_currency(client, signed_in, saved_currencies):
    signed_in("bob@example.com")

    response = client.put("/me/currency", json={"currency": "GBP"})
    refused = client.put("/me/currency", json={"currency": "XYZ"})

    assert response.json()["currency"] == "GBP"
    assert refused.status_code == 422
    assert saved_currencies == {("user", "bob@example.com"): "GBP"}


@pytest.mark.parametrize(("country", "kept"), [(None, None), ("NO", "EUR")])
def test_a_new_accounts_currency_is_saved_only_with_a_country(
    client, saved_currencies, country, kept
):
    params = {"country": country} if country else {}

    response = client.post("/internal/users/ann/currency", params=params, headers=fresh_auth())

    assert response.status_code == 204
    assert saved_currencies.get(("user", "ann")) == kept


@pytest.mark.parametrize(
    ("saved", "country", "shown"),
    [(None, None, "USD"), (None, "DE", "EUR"), ("GBP", None, "GBP"), ("GBP", "US", "GBP")],
)
def test_a_companys_prices_are_in_its_currency_with_or_without_a_country(
    client, editor, saved_currencies, no_auto_top_up, saved, country, shown
):
    if saved:
        saved_currencies[("company", COMPANY_ID)] = saved

    editor("ann")
    headers = {"X-Client-Country": country} if country else {}
    catalog = client.get(f"{COMPANY}/billing/catalog", headers=headers)
    currency = client.get(f"{COMPANY}/billing/currency", headers=headers)
    auto_top_up = client.get(f"{COMPANY}/auto-top-up", headers=headers)

    assert catalog.json()["currency"] == shown
    assert currency.json()["currency"] == shown
    assert auto_top_up.json()["currency"] == shown


def test_a_company_is_welcomed_with_or_without_its_owners_country(
    client, monkeypatch, saved_currencies
):
    async def welcomed(session, company_id, owner_email):
        return False

    monkeypatch.setattr("billing.services.wallets.welcome_gift", welcomed)

    for company, country in (("acme", None), ("beta", "IE")):
        body = {"owner_email": "ann@example.com", **({"country": country} if country else {})}
        response = client.post(
            f"/internal/companies/{company}/welcome", json=body, headers=fresh_auth()
        )
        assert response.status_code == 204

    assert saved_currencies == {("company", "beta"): "EUR"}
