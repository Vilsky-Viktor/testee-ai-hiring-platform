"""Charges of automatic top-ups Paddle didn't answer (a timeout, an error on its side, a charge cut
off): looked up in Paddle a while later instead of holding the company's balance empty for a
day."""

import logging
from datetime import datetime

from testee_common.events.notifications import NotificationKind, notification

from billing.constants.notifications import TOP_UP_LINK
from billing.constants.products import AUTO_TOP_UP_RECHECK_AFTER
from billing.core.db import Session
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
    so it counts once). One Paddle doesn't have was never made: it's charged again now, and when
    Paddle fails that too, the company's owners and admins are told, once a day. Not knowing what
    Paddle has (it's down), changes nothing, so a charge is never made twice."""
    before = now - AUTO_TOP_UP_RECHECK_AFTER
    rows = await unanswered(before)

    if not rows:
        return

    await credit_completed(min(row.charged_at for row in rows))

    for row in await unanswered(before):
        async with Session.begin() as session:
            forgotten = await auto_top_up_charges.never_made(
                session, row.owner_type, row.owner_id, row.charged_at
            )

        if forgotten and not await check(row.owner_type, row.owner_id):
            await tell_missed(row, now)


async def tell_missed(row: AutoTopUp, now: datetime) -> None:
    logger.warning("Automatic top-up unanswered twice for %s", row.owner_id)
    event = notification(
        row.owner_type,
        row.owner_id,
        NotificationKind.AUTO_TOP_UP_FAILED,
        TOP_UP_LINK,
        key=f"{row.owner_id}:{now.date()}",
    )

    async with Session.begin() as session:
        events.tell(session, event)

    await outbox_service.flush_quietly()
