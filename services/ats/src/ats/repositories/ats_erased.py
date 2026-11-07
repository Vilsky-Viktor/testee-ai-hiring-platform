from datetime import datetime
from uuid import UUID

from sqlalchemy import Delete, exists, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from testee_common.db.db import delete_in_batches

from ats.models.ats import AtsCandidate, AtsErasedCandidate


async def delete_and_remember(session: AsyncSession, deletion: Delete) -> None:
    """Runs a deletion of ats_candidates, keeping what tells each one apart."""
    rows = await session.execute(
        deletion.returning(
            AtsCandidate.connection_id,
            AtsCandidate.candidate_id,
            AtsCandidate.interview_id,
            AtsCandidate.company_id,
        )
    )
    erased = [row._asdict() for row in rows]

    if erased:
        await session.execute(insert(AtsErasedCandidate).values(erased).on_conflict_do_nothing())


async def was_erased(
    session: AsyncSession, connection_id: UUID, candidate_id: str, interview_id: UUID
) -> bool:
    return await session.scalar(
        select(
            exists().where(
                AtsErasedCandidate.connection_id == connection_id,
                AtsErasedCandidate.candidate_id == candidate_id,
                AtsErasedCandidate.interview_id == interview_id,
            )
        )
    )


async def delete_older_than(sessions, before: datetime) -> int:
    """A batch at a time, each batch its own transaction (`sessions` makes them); how many."""
    return await delete_in_batches(
        sessions, AtsErasedCandidate, AtsErasedCandidate.erased_at < before
    )
