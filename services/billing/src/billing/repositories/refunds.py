from collections.abc import Iterable
from datetime import datetime

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from billing.constants.credits import ADJUSTMENTS, HoldStatus, Reason
from billing.constants.refunds import REFUND_OPEN, RefundStatus
from billing.models.billing import Entry, Hold, Refund

# What paid credits move through: top-ups, and refunds and chargebacks of them.
MONEY_REASONS = (Reason.TOPUP, *ADJUSTMENTS)


async def money_movements(
    session: AsyncSession, owner_type: str, owner_id: str, since: datetime
) -> list[Entry]:
    """The wallet's top-ups, refunds and chargebacks from `since`, newest first."""
    query = (
        select(Entry)
        .where(
            Entry.owner_type == owner_type,
            Entry.owner_id == owner_id,
            Entry.reason.in_(MONEY_REASONS),
            Entry.created_at >= since,
        )
        .order_by(Entry.created_at.desc(), Entry.id)
    )

    return list(await session.scalars(query))


async def paid_credits(session: AsyncSession, owner_type: str, owner_id: str) -> int:
    """All the credits the wallet ever bought, less those refunded or charged back."""
    query = select(func.coalesce(func.sum(Entry.amount), 0)).where(
        Entry.owner_type == owner_type,
        Entry.owner_id == owner_id,
        Entry.reason.in_(MONEY_REASONS),
    )

    return await session.scalar(query)


async def in_flight(session: AsyncSession, owner_type: str, owner_id: str) -> list[Refund]:
    """The wallet's refunds on their way."""
    query = select(Refund).where(
        Refund.owner_type == owner_type,
        Refund.owner_id == owner_id,
        Refund.status.in_(REFUND_OPEN),
    )

    return list(await session.scalars(query))


async def latest(session: AsyncSession, transaction_ids: Iterable[str]) -> dict[str, str]:
    """Each transaction's latest refund status, leaving out those that never reached Paddle."""
    query = (
        select(Refund.transaction_id, Refund.status)
        .where(Refund.transaction_id.in_(list(transaction_ids)))
        .where(Refund.status != RefundStatus.FAILED)
        .distinct(Refund.transaction_id)
        .order_by(Refund.transaction_id, Refund.created_at.desc())
    )

    return dict((await session.execute(query)).tuples().all())


async def returned_since(
    session: AsyncSession, owner_type: str, owner_id: str, since: datetime
) -> list[Hold]:
    """The candidates' credits given back to the wallet from `since`."""
    query = select(Hold).where(
        Hold.owner_type == owner_type,
        Hold.owner_id == owner_id,
        Hold.reason == Reason.CANDIDATE,
        Hold.status == HoldStatus.RELEASED,
        Hold.released_at >= since,
    )

    return list(await session.scalars(query))


async def get(session: AsyncSession, refund_id) -> Refund | None:
    return await session.get(Refund, refund_id, populate_existing=True)


async def locked(session: AsyncSession, refund_id) -> Refund | None:
    return await session.get(Refund, refund_id, with_for_update=True, populate_existing=True)


def add(
    session: AsyncSession,
    owner_type: str,
    owner_id: str,
    transaction_id: str,
    credits: int,
    amount: int,
    currency: str,
) -> Refund:
    refund = Refund(
        owner_type=owner_type,
        owner_id=owner_id,
        transaction_id=transaction_id,
        credits=credits,
        amount_minor=amount,
        currency=currency,
        status=RefundStatus.CLAIMED,
    )
    session.add(refund)

    return refund


async def matching(session: AsyncSession, adjustment: dict) -> Refund | None:
    """The open refund a Paddle adjustment is, locked: the one Paddle's answer tied to it, or,
    when its web hook comes before that answer, the transaction's refund of the same amount
    still waiting for one. None for any other adjustment, or a repeated one."""
    query = (
        select(Refund)
        .where(
            Refund.status.in_(REFUND_OPEN),
            or_(
                Refund.adjustment_id == adjustment["id"],
                (Refund.adjustment_id.is_(None))
                & (Refund.transaction_id == adjustment["transaction_id"])
                & (Refund.amount_minor == int(adjustment["totals"]["total"])),
            ),
        )
        .with_for_update()
        .execution_options(populate_existing=True)
    )

    return await session.scalar(query)


async def overdue(session: AsyncSession, before: datetime, limit: int) -> list[Refund]:
    """Refunds open since before `before`, oldest first."""
    query = (
        select(Refund)
        .where(Refund.status.in_(REFUND_OPEN), Refund.created_at < before)
        .order_by(Refund.created_at)
        .limit(limit)
    )

    return list(await session.scalars(query))
