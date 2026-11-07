from datetime import UTC, datetime

from sqlalchemy.ext.asyncio import AsyncSession
from testee_common.events.audit_actions import AuditAction

from billing.constants.currencies import DEFAULT_CURRENCY, ChoiceOwner, Currency
from billing.constants.products import OwnerType
from billing.core.db import Session
from billing.helpers.currencies import currency_for, known_country
from billing.models.billing import AutoTopUp
from billing.repositories import auto_top_up_prices, auto_top_ups, company_actions, currencies
from billing.repositories.events import tell
from billing.schemas.billing import AutoTopUpCurrencyChange, CompanyCurrencyOut
from billing.services.auto_top_up_notices import currency_changed
from billing.services.auto_top_up_prices import charge_price


async def saved_in(
    session: AsyncSession, owner_type: ChoiceOwner, owner_id: str, country: str | None
) -> Currency:
    """The owner's saved currency. One without yet gets their country's, saved the first time
    billing sees them with a known country (US dollars until then), so travelling later changes
    nothing."""
    found = await currencies.chosen(session, owner_type, owner_id)

    if found:
        return Currency(found)

    if not known_country(country):
        return DEFAULT_CURRENCY

    return Currency(await currencies.remember(session, owner_type, owner_id, currency_for(country)))


async def saved(owner_type: ChoiceOwner, owner_id: str, country: str | None) -> Currency:
    async with Session.begin() as session:
        return await saved_in(session, owner_type, owner_id, country)


async def decide(
    country: str | None, user_id: str | None = None, company_id: str | None = None
) -> Currency:
    """The currency prices are shown and charged in: the company's when it's the company's
    money, else the signed-in person's, else (signed out) their country's, not saved."""
    if company_id:
        return await saved(ChoiceOwner.COMPANY, company_id, country)

    if user_id:
        return await saved(ChoiceOwner.USER, user_id, country)

    return currency_for(country)


async def choose(owner_type: ChoiceOwner, owner_id: str, currency: Currency) -> None:
    async with Session.begin() as session:
        await currencies.choose(session, owner_type, owner_id, currency)


def changed_top_up(
    row: AutoTopUp | None, before: str | None, currency: Currency, now: datetime
) -> AutoTopUpCurrencyChange | None:
    """What a running automatic top-up costs before and after the company moves from `before` to
    `currency`; None when none is running or the currency stays."""
    was = Currency(before or DEFAULT_CURRENCY)

    if row is None or row.subscription_id is None or was == currency:
        return None

    return AutoTopUpCurrencyChange(
        price=charge_price(row, was, now),
        currency=was,
        new_price=charge_price(row, currency, now),
        new_currency=currency,
    )


async def top_up_change(company_id: str, currency: Currency) -> AutoTopUpCurrencyChange | None:
    """What choosing `currency` would do to the company's running automatic top-up."""
    async with Session() as session:
        row = await auto_top_ups.get(session, OwnerType.COMPANY, company_id)
        before = await currencies.chosen(session, ChoiceOwner.COMPANY, company_id)

    return changed_top_up(row, before, currency, datetime.now(UTC))


async def choose_company(
    company_id: str, currency: Currency, actor: str | None = None
) -> CompanyCurrencyOut:
    """From now on its top-ups are priced and charged in it, automatic ones too, at once and at
    the price list's price in it (their next charge switches the subscription over). A running
    automatic top-up's new price is agreed in the same save, and its company's owners and admins
    are told both amounts (a bell notification and an email), once per change: the top-up's row
    is locked, so of two saves at once only the first finds a change. The answer says the new
    price. The `actor`'s choice goes to the action log in the same save."""
    async with Session.begin() as session:
        row = await auto_top_ups.locked(session, OwnerType.COMPANY, company_id)
        before = await currencies.chosen(session, ChoiceOwner.COMPANY, company_id)
        change = changed_top_up(row, before, currency, datetime.now(UTC))
        await currencies.choose(session, ChoiceOwner.COMPANY, company_id, currency)

        if actor is not None:
            company_actions.log(session, company_id, actor, AuditAction.CURRENCY_CHANGED)

        if change is not None:
            await auto_top_up_prices.agree(
                session, OwnerType.COMPANY, company_id, change.new_price, currency
            )
            tell(session, currency_changed(company_id, change))

    return CompanyCurrencyOut(
        currency=currency, auto_top_up_price=change.new_price if change else None
    )
