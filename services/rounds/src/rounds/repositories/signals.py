import uuid
from datetime import timedelta

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from rounds.constants.integrity import MIN_TAB_LEAVE_SECONDS, IntegritySignal
from rounds.models.signals import Signal


async def drop_short_leave(session: AsyncSession, session_id: uuid.UUID) -> None:
    """The candidate is back: their latest page leave goes if it began under
    MIN_TAB_LEAVE_SECONDS ago. Only the leave's own time is compared, so no length is ever sent
    or kept; a return with no such leave changes nothing."""
    latest = (
        select(Signal.id)
        .where(Signal.session_id == session_id, Signal.kind == IntegritySignal.TAB_LEAVE)
        .order_by(Signal.created_at.desc())
        .limit(1)
        .scalar_subquery()
    )

    await session.execute(
        delete(Signal).where(
            Signal.id == latest,
            Signal.created_at > func.now() - timedelta(seconds=MIN_TAB_LEAVE_SECONDS),
        )
    )


async def add_signal(
    session: AsyncSession,
    session_id: uuid.UUID,
    question_id: uuid.UUID | None,
    kind: IntegritySignal,
    most: int,
) -> None:
    """Saves the signal, unless its question already holds `most` (the caller's limit): the rest
    are dropped silently, so a script can't flood the table or the scorecard that loads them."""
    kept = select(func.count()).where(
        Signal.session_id == session_id, Signal.question_id.is_not_distinct_from(question_id)
    )

    # The question's signals are counted under a lock, so two at once can't both pass the count.
    lock = func.pg_advisory_xact_lock(func.hashtext(f"signals:{session_id}:{question_id}"))

    await session.execute(select(lock))

    if await session.scalar(kept) >= most:
        return

    session.add(Signal(session_id=session_id, question_id=question_id, kind=kind))
    await session.flush()
