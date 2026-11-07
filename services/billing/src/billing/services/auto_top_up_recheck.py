"""Charges of automatic top-ups Paddle didn't answer (a timeout, an error on its side, a charge cut
off): looked up in Paddle a while later instead of holding the company's balance empty for a
day. A card is never charged twice: only Paddle's records showing no charge at all allow another."""

import logging
from datetime import datetime

from testee_common.events.notifications import (
    TOP_UP_UNCONFIRMED,
    NotificationKind,
    notification,
)

from billing.constants.notifications import TOP_UP_LINK
from billing.constants.products import (
    AUTO_TOP_UP_CLOCK_SKEW,
    AUTO_TOP_UP_RECHECK_AFTER,
    AUTO_TOP_UP_UNCREDITED_WAIT,
)
from billing.core.db import Session
from billing.integrations import paddle
from billing.models.billing import AutoTopUp
from billing.repositories import auto_top_up_charges, auto_top_ups, events
from billing.services import outbox as outbox_service
from billing.services.auto_top_up_charging import check
from billing.services.reconciliation import credit_completed

logger = logging.getLogger(__name__)


async def unanswered(before: datetime) -> list[AutoTopUp]:
    async with Session() as session:
        return await auto_top_ups.unanswered(session, before)


async def recheck(now: datetime) -> None:
    """Every 15 minutes: a charge Paddle took gets its credits (the same handler as its web hook,
    so it counts once). One Paddle's records show it never took is charged again now, and when
    that isn't made either, the company's owners and admins are told, once a day. Anything else
    (a transaction in any state, an answer that can't be read) only means looking again later;
    still unknown after AUTO_TOP_UP_UNCREDITED_WAIT, they're told and the looking ends."""
    before = now - AUTO_TOP_UP_RECHECK_AFTER
    rows = await unanswered(before)

    if not rows:
        return

    try:
        await credit_completed(min(row.charged_at for row in rows))
    except Exception:
        logger.exception("Couldn't read Paddle's completed transactions")

    for row in await unanswered(before):
        if await never_charged(row):
            await charge_again(row, now)
        elif row.charged_at <= now - AUTO_TOP_UP_UNCREDITED_WAIT:
            await stop(row, now)


async def never_charged(row: AutoTopUp) -> bool:
    """Whether Paddle's records prove the charge was never made; an answer that can't be read
    proves nothing."""
    try:
        since = row.charged_at - AUTO_TOP_UP_CLOCK_SKEW

        return not await paddle.charges_since(row.subscription_id, since)
    except Exception:
        logger.exception("Couldn't read the transactions of %s", row.owner_id)

        return False


async def charge_again(row: AutoTopUp, now: datetime) -> None:
    async with Session.begin() as session:
        forgotten = await auto_top_up_charges.never_made(
            session, row.owner_type, row.owner_id, row.charged_at
        )

    if forgotten and not await check(row.owner_type, row.owner_id):
        logger.warning("Automatic top-up unanswered twice for %s", row.owner_id)
        await tell(row, f"{row.owner_id}:{now.date()}")


async def stop(row: AutoTopUp, now: datetime) -> None:
    async with Session.begin() as session:
        stopped = await auto_top_up_charges.unconfirmed(
            session, row.owner_type, row.owner_id, row.charged_at, now
        )

    if stopped:
        logger.error("Automatic top-up of %s unknown after a day: stopped", row.owner_id)
        await tell(row, f"{row.owner_id}:{row.charged_at.isoformat()}")


async def tell(row: AutoTopUp, key: str) -> None:
    """Told as a failed charge is, but for what it is: nothing says the card failed."""
    event = notification(
        row.owner_type,
        row.owner_id,
        NotificationKind.AUTO_TOP_UP_FAILED,
        TOP_UP_LINK,
        key=key,
        reason=TOP_UP_UNCONFIRMED,
    )

    async with Session.begin() as session:
        events.tell(session, event)

    await outbox_service.flush_quietly()
