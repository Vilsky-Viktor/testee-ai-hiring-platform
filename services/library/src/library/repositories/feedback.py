import uuid
from datetime import datetime

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from testee_common.db.db import update_in_batches

from library.models.feedback import QuestionRating, QuestionReport


async def change_rating(
    session: AsyncSession, question_id: uuid.UUID, value: int | None, previous: int | None
) -> None:
    """Moves the question's counts from one vote (`previous`, none for a first vote) to another
    (`value`, none when it's taken back). Two at once both count; a count never goes below 0, as
    the caller's `previous` can't be checked: no vote is kept by person."""
    likes = (value == 1) - (previous == 1)
    dislikes = (value == -1) - (previous == -1)
    statement = (
        insert(QuestionRating)
        .values(question_id=question_id, likes=max(likes, 0), dislikes=max(dislikes, 0))
        .on_conflict_do_update(
            index_elements=[QuestionRating.question_id],
            set_={
                "likes": func.greatest(QuestionRating.likes + likes, 0),
                "dislikes": func.greatest(QuestionRating.dislikes + dislikes, 0),
            },
        )
    )

    await session.execute(statement)


async def question_stats(
    session: AsyncSession, question_ids: list[uuid.UUID]
) -> dict[uuid.UUID, dict[str, int]]:
    """Likes, dislikes and reports per question; questions without feedback are missing."""
    ratings = select(
        QuestionRating.question_id, QuestionRating.likes, QuestionRating.dislikes
    ).where(QuestionRating.question_id.in_(question_ids))
    reports = (
        select(QuestionReport.question_id, func.count())
        .where(QuestionReport.question_id.in_(question_ids))
        .group_by(QuestionReport.question_id)
    )
    stats = {}

    for question_id, likes, dislikes in await session.execute(ratings):
        stats[question_id] = {"likes": likes, "dislikes": dislikes, "reports": 0}

    for question_id, count in await session.execute(reports):
        stats.setdefault(question_id, {"likes": 0, "dislikes": 0, "reports": 0})
        stats[question_id]["reports"] = count

    return stats


async def list_reports(
    session: AsyncSession, question_id: uuid.UUID, offset: int = 0, limit: int | None = None
) -> list[QuestionReport]:
    """Newest first; without a limit, every report (the verifier reads them all)."""
    query = (
        select(QuestionReport)
        .where(QuestionReport.question_id == question_id)
        .order_by(QuestionReport.created_at.desc(), QuestionReport.id)
        .offset(offset)
        .limit(limit)
    )

    return list(await session.scalars(query))


async def report_question(
    session: AsyncSession, question_id: uuid.UUID, reason: str, comment: str
) -> None:
    session.add(QuestionReport(question_id=question_id, reason=reason, comment=comment))


async def clear_old_comments(sessions, before: datetime) -> int:
    """Empties the comments of reports made before `before`; the reports stay. Batched: each
    batch its own transaction, from `sessions`. How many went."""
    return await update_in_batches(
        sessions,
        QuestionReport,
        {"comment": ""},
        QuestionReport.comment != "",
        QuestionReport.created_at < before,
    )
