from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from billing.constants.credits import HISTORY_KINDS, Reason
from billing.models.billing import Entry


async def page(
    session: AsyncSession,
    owner_type: str,
    owner_id: str,
    offset: int,
    limit: int,
    kind: str | None = None,
    start: datetime | None = None,
    end: datetime | None = None,
) -> list[Entry]:
    """A wallet's movements, newest first; with `kind`, only that kind's (HISTORY_KINDS); with
    `start` and `end`, only those from `start` and before `end`."""
    filters = [Entry.owner_type == owner_type, Entry.owner_id == owner_id]

    if kind is not None:
        filters.append(Entry.reason.in_(HISTORY_KINDS[kind]))

    if start is not None:
        filters.append(Entry.created_at >= start)

    if end is not None:
        filters.append(Entry.created_at < end)

    query = (
        select(Entry)
        .where(*filters)
        .order_by(Entry.created_at.desc(), Entry.id)
        .offset(offset)
        .limit(limit)
    )

    return list(await session.scalars(query))


async def spent_since(
    session: AsyncSession, owner_type: str, owner_id: str, since: datetime
) -> int:
    """The credits a wallet's candidates took since `since`."""
    query = select(func.coalesce(func.sum(-Entry.amount), 0)).where(
        Entry.owner_type == owner_type,
        Entry.owner_id == owner_id,
        Entry.reason == Reason.CANDIDATE,
        Entry.created_at >= since,
    )

    return await session.scalar(query)
