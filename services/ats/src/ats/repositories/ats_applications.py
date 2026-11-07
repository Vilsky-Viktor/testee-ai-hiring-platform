from datetime import datetime
from uuid import UUID

from sqlalchemy import delete, func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from testee_common.db.db import delete_in_batches
from testee_common.events import outbox

from ats.constants.ats import ConnectionStatus
from ats.constants.events import ATS_APPLICATION_CHANGED
from ats.models.ats import AtsApplicationChange, AtsConnection
from ats.models.outbox import OutboxEvent
from ats.repositories.ats import company_of
from ats.repositories.turns import in_turns


async def add(session: AsyncSession, connection_id: UUID, application_id: str) -> None:
    """The application changed: saved, or its row's `changed_at` moved if it's still to be read
    (a read already running then keeps the row, as it may have seen the older state), with the
    event that reads it."""
    query = (
        insert(AtsApplicationChange)
        .values(
            connection_id=connection_id,
            company_id=company_of(connection_id),
            application_id=application_id,
        )
        .on_conflict_do_update(
            index_elements=["connection_id", "application_id"],
            set_={"changed_at": func.now()},
        )
        .returning(AtsApplicationChange.id)
    )
    row_id = await session.scalar(query)

    outbox.add(
        session, OutboxEvent, ATS_APPLICATION_CHANGED, {"ats_application_change_id": str(row_id)}
    )


async def get(session: AsyncSession, row_id: UUID) -> AtsApplicationChange | None:
    return await session.get(AtsApplicationChange, row_id)


async def done(session: AsyncSession, row: AtsApplicationChange) -> None:
    """Read: the row goes, unless the application changed again meanwhile."""
    await session.execute(
        delete(AtsApplicationChange).where(
            AtsApplicationChange.id == row.id,
            AtsApplicationChange.changed_at == row.changed_at,
        )
    )


async def recoverable(session: AsyncSession) -> list[AtsApplicationChange]:
    """For the recovery job: what working connections have left to read, oldest first, each
    connection's in turn."""
    working = select(AtsConnection.id).where(AtsConnection.status == ConnectionStatus.CONNECTED)
    query = in_turns(
        AtsApplicationChange,
        (AtsApplicationChange.connection_id.in_(working),),
        AtsApplicationChange.changed_at,
    )

    return list((await session.scalars(query)).all())


async def delete_older_than(sessions, before: datetime) -> int:
    """Rows not read since before `before` go, a batch at a time; how many."""
    return await delete_in_batches(
        sessions, AtsApplicationChange, AtsApplicationChange.changed_at < before
    )
