import logging
from datetime import datetime

from billing.constants.reconciliation import RECONCILE_WINDOW
from billing.constants.refunds import RECONCILE_MAX_REFUNDS, REFUND_CLOCK_SKEW, REFUND_OVERDUE
from billing.core.db import Session
from billing.integrations import paddle
from billing.models.billing import Refund
from billing.repositories import purchases, refunds
from billing.services import refund_claims
from billing.services.adjustments import handle_adjustment
from billing.services.topups import handle_completed

logger = logging.getLogger(__name__)


async def reconcile(now: datetime) -> None:
    """Daily: does again, from Paddle's own records, what its web hooks of the last
    RECONCILE_WINDOW should have done, through the same idempotent handlers, so a web hook Paddle
    gave up on (a wrong secret, an outage) still adds the credits a payment bought and takes back
    those of a refund or chargeback. What it finds missing is logged; what was done is skipped.
    Transactions come first, so a refund whose payment's web hook was lost counts too."""
    since = now - RECONCILE_WINDOW
    await credit_completed(since)
    adjustments = await paddle.approved_adjustments(since)
    pairs = [(item["transaction_id"], item["id"]) for item in adjustments]
    done = await counted(pairs)

    for adjustment in adjustments:
        if adjustment["id"] not in done:
            await quietly(handle_adjustment, adjustment)

    for found in await counted(pairs) - done:
        logger.warning("Reconciliation counted adjustment %s: its web hook didn't", found)

    await settle_open_refunds(now)


async def credit_completed(since: datetime) -> None:
    """Paddle's completed transactions since then that billing hasn't credited, credited."""
    transactions = await paddle.completed_transactions(since)
    ids = [transaction["id"] for transaction in transactions]
    known = await credited(ids)

    for transaction in transactions:
        if transaction["id"] not in known:
            await quietly(handle_completed, transaction)

    for found in await credited([id_ for id_ in ids if id_ not in known]):
        logger.warning("Reconciliation credited transaction %s: its web hook didn't", found)


async def settle_open_refunds(now: datetime) -> None:
    """Company refunds still open an hour on: Paddle's answer was lost, or its web hook was (a
    rejection above all, which the approved adjustments don't list)."""
    async with Session() as session:
        overdue = await refunds.overdue(session, now - REFUND_OVERDUE, RECONCILE_MAX_REFUNDS)

    for refund in overdue:
        try:
            await settle(refund)
        except Exception:
            logger.exception("Reconciling refund %s failed", refund.id)


async def settle(refund: Refund) -> None:
    """Goes by what Paddle has for the refund; one it never got gives its credits back."""
    since = refund.created_at - REFUND_CLOCK_SKEW
    found = next(
        (
            item
            for item in await paddle.refunds_of(refund.transaction_id)
            if item["id"] == refund.adjustment_id
            or (
                refund.adjustment_id is None
                and int(item["totals"]["total"]) == refund.amount_minor
                and datetime.fromisoformat(item["created_at"]) >= since
            )
        ),
        None,
    )

    if found is not None:
        await handle_adjustment(found)
    elif refund.adjustment_id is None:
        logger.warning("Refund %s never reached Paddle: its credits are given back", refund.id)
        await refund_claims.give_back_unsent(refund.id)


async def credited(ids: list[str]) -> set[str]:
    async with Session() as session:
        return await purchases.credited(session, ids)


async def counted(pairs: list[tuple[str, str]]) -> set[str]:
    async with Session() as session:
        return await purchases.counted(session, pairs)


async def quietly(handler, data: dict) -> None:
    """One item's failure is logged and leaves the rest to go on; the next run tries it again."""
    try:
        await handler(data)
    except Exception:
        logger.exception("Reconciling %s failed", data.get("id"))
