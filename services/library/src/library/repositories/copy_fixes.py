import uuid

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from library.constants.quality import COPY_FIX_BATCH
from library.models.sets import Question
from library.repositories import quality


async def content_of(
    session: AsyncSession, question_id: uuid.UUID
) -> tuple[str, list[dict]] | None:
    """A question's current text and options, if it's still there."""
    question = await session.get(Question, question_id)

    return (question.text, question.options) if question else None


async def stale_copies(
    session: AsyncSession, question_id: uuid.UUID, old_text: str, old_options: list[dict]
) -> list[uuid.UUID]:
    """Up to COPY_FIX_BATCH copies of a fixed bank question that still hold its old content
    (not one a company changed, nor one fixed on its own). Copies another run holds are skipped,
    and a fixed copy no longer matches, so running it again fixes nothing twice."""
    return list(
        await session.scalars(
            select(Question.id)
            .where(
                Question.source_question_id == question_id,
                Question.text == old_text,
                Question.options == old_options,
            )
            .limit(COPY_FIX_BATCH)
            .with_for_update(skip_locked=True)
        )
    )


async def fix_copy(
    session: AsyncSession, copy_id: uuid.UUID, text: str, options: list[dict]
) -> None:
    """The copy gets this content, its old one kept as a fixed revision."""
    await quality.archive(session, copy_id, fixed=True)
    await session.execute(
        update(Question).where(Question.id == copy_id).values(text=text, options=options)
    )
