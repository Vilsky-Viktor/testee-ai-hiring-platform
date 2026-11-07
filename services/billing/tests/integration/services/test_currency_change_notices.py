"""A company changing its currency while automatic top-up runs, against Postgres: both amounts
from billing, the new price agreed and one notice per change in the outbox, in the same save."""

import uuid
from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import select, update

from billing.constants.currencies import Currency
from billing.constants.products import OwnerType
from billing.core.db import Session
from billing.models.billing import AutoTopUp
from billing.models.outbox import OutboxEvent
from billing.repositories import auto_top_up_prices as price_rows
from billing.repositories import auto_top_ups as rows
from billing.schemas.billing import AutoTopUpIn
from billing.services import auto_top_ups, currencies
from tests.integration.services.test_auto_top_up_price_notices import agreed_at
from tests.integration.transactions import transaction

COMPANY = OwnerType.COMPANY
TO_POUNDS = {"price": 4500, "currency": "USD", "new_price": 4000, "new_currency": "GBP"}


async def told(acme: str) -> list[dict]:
    """The price notices for acme waiting in billing's outbox, oldest first."""
    async with Session() as session:
        found = await session.scalars(
            select(OutboxEvent)
            .where(
                OutboxEvent.data["recipient_id"].astext == acme,
                OutboxEvent.data["kind"].astext == "auto_top_up_price_change",
            )
            .order_by(OutboxEvent.created_at)
        )

        return [row.data for row in found]


@pytest.fixture
def company():
    return str(uuid.uuid4()), f"user-{uuid.uuid4()}"


def test_a_change_shows_both_amounts_then_applies_them_with_one_notice(run, paddle_calls, company):
    acme, ann = company

    async def scenario():
        await agreed_at(acme, ann, 4500)
        row = await transaction(rows.get, COMPANY, acme)
        day = datetime.now(UTC) + timedelta(days=31)
        await transaction(price_rows.announce, COMPANY, acme, row, 5000, day, {})
        asked = await currencies.top_up_change(acme, Currency.GBP)
        chosen = await currencies.choose_company(acme, Currency.GBP)

        return asked, chosen, await transaction(rows.get, COMPANY, acme), await told(acme)

    asked, chosen, row, notices = run(scenario())

    assert asked.model_dump(mode="json") == TO_POUNDS
    assert chosen.auto_top_up_price == 4000
    # The price announced in dollars no longer applies.
    assert (row.price, row.price_currency, row.next_price, row.next_price_from) == (
        4000,
        "GBP",
        None,
        None,
    )
    assert [notice["data"] for notice in notices] == [TO_POUNDS]


def test_the_same_currency_saved_again_tells_nobody(run, paddle_calls, company):
    acme, ann = company

    async def scenario():
        await agreed_at(acme, ann, 4500)
        await currencies.choose_company(acme, Currency.GBP)
        again = await currencies.top_up_change(acme, Currency.GBP)
        second = await currencies.choose_company(acme, Currency.GBP)

        return again, second, await told(acme)

    again, second, notices = run(scenario())

    assert again is None
    assert second.auto_top_up_price is None
    assert len(notices) == 1


def test_there_and_back_are_two_changes_and_two_notices(run, paddle_calls, company):
    acme, ann = company

    async def scenario():
        await agreed_at(acme, ann, 4500)
        await currencies.choose_company(acme, Currency.GBP)
        await currencies.choose_company(acme, Currency.USD)

        return await transaction(rows.get, COMPANY, acme), await told(acme)

    row, notices = run(scenario())

    # Back in dollars it's the price list's $50: the $45 agreed before went with the change.
    assert [notice["data"] for notice in notices] == [
        TO_POUNDS,
        {"price": 4000, "currency": "GBP", "new_price": 5000, "new_currency": "USD"},
    ]
    assert (row.price, row.price_currency) == (5000, "USD")


def test_a_paused_top_up_is_told_too_and_stays_paused(run, paddle_calls, company):
    """Once its card is updated it charges the new amount, so it's confirmed and told now."""
    acme, ann = company
    paused_at = datetime.now(UTC)

    async def scenario():
        await agreed_at(acme, ann, 4500)

        async with Session.begin() as session:
            await session.execute(
                update(AutoTopUp)
                .where(AutoTopUp.owner_id == acme)
                .values(paused_at=paused_at, declines=4)
            )

        asked = await currencies.top_up_change(acme, Currency.GBP)
        await currencies.choose_company(acme, Currency.GBP)

        return asked, await transaction(rows.get, COMPANY, acme), await told(acme)

    asked, row, notices = run(scenario())

    assert asked.model_dump(mode="json") == TO_POUNDS
    assert [notice["data"] for notice in notices] == [TO_POUNDS]
    assert (row.paused_at, row.price, row.price_currency) == (paused_at, 4000, "GBP")


@pytest.mark.parametrize("set_up", [False, True], ids=["none", "waiting for its card"])
def test_with_no_running_top_up_a_change_asks_nothing_and_tells_nobody(run, company, set_up):
    acme, ann = company

    async def scenario():
        if set_up:
            choice = AutoTopUpIn(product="topup_50", threshold=500, agreed=True)
            await auto_top_ups.turn_on(COMPANY, acme, choice, ann, Currency.USD)

        asked = await currencies.top_up_change(acme, Currency.GBP)
        chosen = await currencies.choose_company(acme, Currency.GBP)

        return asked, chosen, await told(acme)

    asked, chosen, notices = run(scenario())

    assert asked is None
    assert (chosen.currency, chosen.auto_top_up_price) == (Currency.GBP, None)
    assert notices == []
