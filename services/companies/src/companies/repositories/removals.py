from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from testee_common.db.db import delete_in_batches

from companies.models.invites import CandidateInvite
from companies.models.removals import RemovedInvite
from companies.repositories.sync import from_cursor


async def of_company(
    session: AsyncSession,
    company_id: UUID,
    offset: int,
    limit: int,
    since: datetime | None = None,
    after: UUID | None = None,
) -> list[RemovedInvite]:
    """The candidates the company removed in the last REMOVAL_KEEP_DAYS, oldest first; with
    `since`, a sync's page (from_cursor)."""
    order = [RemovedInvite.removed_at, RemovedInvite.invite_id]
    synced = from_cursor(order, since, after) if since else []
    query = (
        select(RemovedInvite)
        .where(RemovedInvite.company_id == company_id, *synced)
        .order_by(*order)
        .offset(offset)
        .limit(limit)
    )

    return list((await session.scalars(query)).all())


async def restored(
    session: AsyncSession, after: datetime, limit: int
) -> list[tuple[CandidateInvite, UUID]]:
    """Up to `limit` invites erased since `after` that are back (a restored backup), each with
    its company; erasing one again takes it out of the next read."""
    query = (
        select(CandidateInvite, RemovedInvite.company_id)
        .join(RemovedInvite, RemovedInvite.invite_id == CandidateInvite.id)
        .where(RemovedInvite.removed_at >= after)
        .limit(limit)
    )

    return [tuple(row) for row in await session.execute(query)]


async def forget(sessions: async_sessionmaker, before: datetime) -> int:
    """Notes of removals from before `before`, a batch at a time, each batch its own transaction
    (`sessions` makes them)."""
    return await delete_in_batches(sessions, RemovedInvite, RemovedInvite.removed_at < before)
