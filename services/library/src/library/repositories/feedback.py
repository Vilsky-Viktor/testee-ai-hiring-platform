import uuid
from datetime import datetime

from sqlalchemy import delete, func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from testee_common.db.db import update_in_batches

from library.models.feedback import QuestionRating, QuestionReport, QuestionReporter


async def rate_question(
    session: AsyncSession, question_id: uuid.UUID, user_id: str, value: int
) -> None:
    """Sets the user's thumbs up or down; voting again changes it."""
    statement = (
        insert(QuestionRating)
        .values(question_id=question_id, user_id=user_id, value=value)
        .on_conflict_do_update(
            index_elements=[QuestionRating.question_id, QuestionRating.user_id],
            set_={"value": value},
        )
    )

    await session.execute(statement)


async def unrate_question(session: AsyncSession, question_id: uuid.UUID, user_id: str) -> None:
    """Removes the user's thumbs up or down; none left is fine."""
    await session.execute(
        delete(QuestionRating).where(
            QuestionRating.question_id == question_id, QuestionRating.user_id == user_id
        )
    )


async def my_question_rating(
    session: AsyncSession, question_id: uuid.UUID, user_id: str
) -> int | None:
    query = select(QuestionRating.value).where(
        QuestionRating.question_id == question_id, QuestionRating.user_id == user_id
    )

    return await session.scalar(query)


async def question_stats(
    session: AsyncSession, question_ids: list[uuid.UUID]
) -> dict[uuid.UUID, dict[str, int]]:
    """Likes, dislikes and reports per question; questions without feedback are missing."""
    ratings = (
        select(
            QuestionRating.question_id,
            func.count().filter(QuestionRating.value == 1),
            func.count().filter(QuestionRating.value == -1),
        )
        .where(QuestionRating.question_id.in_(question_ids))
        .group_by(QuestionRating.question_id)
    )
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


async def mine(
    session: AsyncSession, question_ids: list[uuid.UUID], user_id: str
) -> tuple[dict[uuid.UUID, int], set[uuid.UUID]]:
    """The user's own vote per question, and the questions they've reported (in any revision)."""
    votes = select(QuestionRating.question_id, QuestionRating.value).where(
        QuestionRating.question_id.in_(question_ids), QuestionRating.user_id == user_id
    )
    reported = select(QuestionReporter.question_id).where(
        QuestionReporter.question_id.in_(question_ids), QuestionReporter.user_id == user_id
    )

    return dict((await session.execute(votes)).all()), set(await session.scalars(reported))


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
    session: AsyncSession, question_id: uuid.UUID, user_id: str, reason: str, comment: str
) -> bool:
    """False when the user has reported the question before, in this revision or an earlier one."""
    reporter = (
        insert(QuestionReporter)
        .values(question_id=question_id, user_id=user_id)
        .on_conflict_do_nothing()
        .returning(QuestionReporter.user_id)
    )

    if await session.scalar(reporter) is None:
        return False

    session.add(
        QuestionReport(question_id=question_id, user_id=user_id, reason=reason, comment=comment)
    )

    # A report this user made before reporters were kept breaks the unique report per user
    # and question: the IntegrityError reaches the service, which answers as for a repeat.
    await session.flush()

    return True


async def has_reported(session: AsyncSession, question_id: uuid.UUID, user_id: str) -> bool:
    query = select(QuestionReporter.user_id).where(
        QuestionReporter.question_id == question_id, QuestionReporter.user_id == user_id
    )

    return await session.scalar(query) is not None


async def empty_old_comments(sessions, before: datetime) -> int:
    """Empties the comments of reports written before `before`, a batch at a time; the reports
    stay. Returns how many it emptied; a run cut off midway goes on the next day."""
    return await update_in_batches(
        sessions,
        QuestionReport,
        {"comment": ""},
        QuestionReport.comment != "",
        QuestionReport.created_at < before,
    )
