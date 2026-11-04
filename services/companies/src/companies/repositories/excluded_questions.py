from collections.abc import Callable

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from companies.models.interviews import Interview


async def change(
    session: AsyncSession,
    interview_id,
    change: Callable[[dict[str, list[str]], dict[str, int]], dict[str, list[str]]],
) -> None:
    """Stores the questions left out that `change` makes of the stored ones and the topics'
    numbers; it raises to refuse, with nothing changed. Locked, so two changes at once (or one
    beside a topic's number changing) each see the other's."""
    interview = await session.scalar(
        select(Interview).where(Interview.id == interview_id).with_for_update()
    )
    interview.excluded_questions = change(interview.excluded_questions, interview.topic_limits)
