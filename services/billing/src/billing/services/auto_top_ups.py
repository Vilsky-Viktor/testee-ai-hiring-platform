import asyncio
import logging
from datetime import UTC, datetime

from fastapi import HTTPException, status
from testee_common.config.constants import DEFAULT_LANGUAGE
from testee_common.events.analytics import track
from testee_common.events.audit_actions import AuditAction

from billing.config import settings
from billing.constants.currencies import Currency
from billing.constants.products import (
    AGREEMENT_NEEDED,
    AUTO_TOP_UP_FLAG,
    AUTO_TOP_UP_THRESHOLDS,
    NOT_YOUR_AUTO_TOP_UP,
    SCHEDULED_CANCEL,
    SUBSCRIPTION_ENDED_STATUS,
    TOP_UP_UNAVAILABLE,
    TOP_UPS,
    WEB_HOOK_STEP_SECONDS,
)
from billing.core.db import Session
from billing.helpers.agreed_terms import agreed_terms
from billing.helpers.credits import top_up_price
from billing.integrations import paddle
from billing.repositories import auto_top_up_charges, auto_top_ups, company_actions
from billing.repositories.events import tell
from billing.schemas.billing import AutoTopUpIn, AutoTopUpOut, CheckoutOut
from billing.services.auto_top_up_cancels import cancel, cancel_for_deletion, cancel_quietly
from billing.services.auto_top_up_charging import check_briefly
from billing.services.auto_top_up_notices import turned_on
from billing.services.auto_top_up_prices import charge_price, listed
from billing.services.web_hook_steps import within_web_hook

logger = logging.getLogger(__name__)


def offered() -> bool:
    return bool(
        settings.paddle_api_key
        and settings.paddle_price_auto_top_up
        and settings.paddle_product_candidates
    )


def products() -> list[str]:
    """The top-ups it can buy: the fixed ones."""
    return [product.key for product in TOP_UPS]


async def out(owner_type: str, owner_id: str, currency: Currency) -> AutoTopUpOut:
    """With each top-up's price in `currency`, the company's, which every charge is in; the
    chosen one at what it charges now (its agreed price), with a new price announced and its
    day."""
    async with Session() as session:
        row = await auto_top_ups.get(session, owner_type, owner_id)

    started = row is not None and row.subscription_id is not None
    sold = products()
    prices = {
        product.key: top_up_price(product, currency) for product in TOP_UPS if product.key in sold
    }
    coming = None

    if row is not None and row.product in prices:
        prices[row.product] = charge_price(row, currency, datetime.now(UTC))
        announced = row.price_currency == currency and row.next_price is not None
        coming = row if announced and prices[row.product] != row.next_price else None

    return AutoTopUpOut(
        offered=offered(),
        on=started,
        waiting=row is not None and not started,
        paused=started and row.paused_at is not None,
        product=row.product if row else None,
        threshold=row.threshold if row else None,
        products=sold,
        thresholds=AUTO_TOP_UP_THRESHOLDS,
        currency=currency,
        prices=prices,
        next_price=coming.next_price if coming else None,
        next_price_from=coming.next_price_from if coming else None,
    )


async def turn_on(
    owner_type: str,
    owner_id: str,
    body: AutoTopUpIn,
    buyer_id: str,
    currency: Currency,
    language: str = DEFAULT_LANGUAGE,
    logged: bool = False,
) -> AutoTopUpOut:
    """Saves the choice, and the buyer's `language`, which names what each charge buys. If it
    isn't running yet, the answer carries the checkout that saves the card; it starts when
    Paddle confirms the subscription. Every save needs the buyer's tick on its terms (`agreed`),
    and keeps when they agreed. With `logged`, a company's action log gets the buyer's change
    with the terms they agreed to, in the same save."""
    if not body.agreed:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, AGREEMENT_NEEDED)

    if not offered() or body.product not in products():
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, TOP_UP_UNAVAILABLE)

    if body.threshold not in AUTO_TOP_UP_THRESHOLDS:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Choose one of the balances")

    async with Session.begin() as session:
        current = await auto_top_ups.get(session, owner_type, owner_id)

        # Running, it charges its buyer's card: another member may turn it off, not change it.
        if current and current.subscription_id and current.buyer_id != buyer_id:
            raise HTTPException(status.HTTP_403_FORBIDDEN, NOT_YOUR_AUTO_TOP_UP)

        row = await auto_top_ups.save(
            session,
            owner_type,
            owner_id,
            body.product,
            body.threshold,
            buyer_id,
            listed(body.product, currency),
            currency,
            datetime.now(UTC),
            language,
        )

        if logged:
            running = current is not None and current.subscription_id is not None
            action = AuditAction.AUTO_TOP_UP_CHANGED if running else AuditAction.AUTO_TOP_UP_SET
            # The price the dialog showed: what a charge costs now (out()).
            price = charge_price(row, currency, datetime.now(UTC))
            terms = agreed_terms(price, currency, row.threshold, language)
            company_actions.log(session, owner_id, buyer_id, action, terms)

    result = await out(owner_type, owner_id, currency)

    # The $0 subscription that saves the card, in the company's currency, which every top-up
    # it charges keeps.
    if row.subscription_id is None:
        custom = {
            "owner_type": owner_type,
            "owner_id": owner_id,
            "buyer_id": buyer_id,
            AUTO_TOP_UP_FLAG: "1",
        }
        item = {"price_id": settings.paddle_price_auto_top_up, "quantity": 1}
        result.checkout = CheckoutOut(
            transaction_id=await paddle.create_transaction([item], currency, custom)
        )

    return result


async def turn_off(
    owner_type: str,
    owner_id: str,
    buyer_id: str | None = None,
    actor: str | None = None,
    deleting: bool = False,
) -> None:
    """Off, once the subscription that keeps the card is cancelled: if Paddle can't cancel it,
    nothing changes and this raises, so turning it off (or deleting the company) can be tried
    again. With `buyer_id`, only if that person's card pays for it (a member removed). An
    `actor`'s turning it off goes to the company's action log in the same save. `deleting`: its
    company is going, which only Paddle's outage holds up (cancel_for_deletion)."""
    stop = cancel_for_deletion if deleting else cancel
    async with Session() as session:
        row = await auto_top_ups.get(session, owner_type, owner_id)

    if row is None or (buyer_id is not None and row.buyer_id != buyer_id):
        return

    if row.subscription_id:
        await stop(row.subscription_id)

    async with Session.begin() as session:
        left = await auto_top_ups.remove(session, owner_type, owner_id, buyer_id)

        if actor is not None:
            company_actions.log(session, owner_id, actor, AuditAction.AUTO_TOP_UP_STOPPED)

    # One started meanwhile goes too.
    if left and left != row.subscription_id:
        await stop(left)


async def start(custom: dict, subscription_id: str, currency: str) -> None:
    """Paddle confirmed the checkout's subscription, in `currency`. One nobody is waiting for (turned off
    meanwhile, or not started by whoever turned it on) is cancelled, so no card is kept. One
    that already ended (its subscription.canceled came first) isn't started."""
    if custom.get(AUTO_TOP_UP_FLAG) != "1":
        return

    owner = (custom.get("owner_type"), custom.get("owner_id"))

    if await owner_of(subscription_id) == owner:
        return

    status_now = await paddle.subscription_status(subscription_id, WEB_HOOK_STEP_SECONDS)

    if status_now == SUBSCRIPTION_ENDED_STATUS:
        return

    async with Session.begin() as session:
        started, attached = await auto_top_ups.start(
            session, *owner, custom.get("buyer_id"), subscription_id, currency
        )

        # Confirmed once, by the event that attached it: the bell, and an email with its terms
        # and how to turn it off.
        if attached is not None:
            tell(session, turned_on(attached, subscription_id, datetime.now(UTC)))

    if not started:
        await cancel_quietly(subscription_id, WEB_HOOK_STEP_SECONDS)

        return

    # The balance may already be under the threshold. Together, as Paddle waits for the answer.
    await asyncio.gather(
        within_web_hook(track("auto_top_up_on", company_id=owner[1])),
        check_briefly(*owner, WEB_HOOK_STEP_SECONDS),
    )


async def owner_of(subscription_id: str) -> tuple[str, str] | None:
    """Whose wallet an automatic charge on this subscription is for."""
    async with Session() as session:
        return await auto_top_ups.owner_of(session, subscription_id)


async def ended(subscription_id: str) -> None:
    """Paddle ended the subscription (cancelled there, or after failed payments): it's off."""
    async with Session.begin() as session:
        await auto_top_ups.remove_subscription(session, subscription_id)


async def cancel_scheduled(data: dict) -> None:
    """A subscription Paddle changed: one its customer cancelled through Paddle's own email link
    or portal (Paddle ends it at the end of the billing period) ends at once, as turning it off
    here does, so no charge follows. If Paddle can't cancel it, this raises and Paddle sends the
    event again."""
    scheduled = data.get("scheduled_change") or {}

    if scheduled.get("action") != SCHEDULED_CANCEL or await owner_of(data["id"]) is None:
        return

    await cancel(data["id"], WEB_HOOK_STEP_SECONDS)
    await ended(data["id"])


async def card_saved(subscription_id: str, saved_at: datetime) -> None:
    """Paddle saved a new card for the subscription at `saved_at`: a pause from before then ends,
    and a balance already under the threshold is topped up with the new card at once."""
    async with Session.begin() as session:
        owner = await auto_top_up_charges.resume(session, subscription_id, saved_at)

    if owner:
        await check_briefly(*owner, WEB_HOOK_STEP_SECONDS)
