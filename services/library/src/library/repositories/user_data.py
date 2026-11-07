from collections.abc import Callable

from sqlalchemy import String, cast, delete, func, literal, select, tuple_, update
from sqlalchemy.ext.asyncio import AsyncSession
from testee_common.events import processed_events
from testee_common.events.deletions import DeletedCandidate

from library.constants.feedback import UNLINKED_USER_PREFIX
from library.models.events import ProcessedEvent
from library.models.feedback import QuestionRating, QuestionReport, QuestionReporter
from library.models.sets import Question, Topic


async def unlink(session: AsyncSession, scope: Callable) -> None:
    """Votes and reports matching `scope(model)` stay for the questions' quality, each with a
    random value of its own, drawn by the database for every row, in place of the person's id,
    so nothing points back to them or joins their rows; a report's comment goes, as it can name
    them. The note that they reported a question only stops them reporting it again, so it goes
    too. Finds nothing the second time."""
    await session.execute(delete(QuestionReporter).where(*scope(QuestionReporter)))
    unlinked = literal(UNLINKED_USER_PREFIX).concat(cast(func.gen_random_uuid(), String))

    for model, values in (
        (QuestionRating, {"user_id": unlinked}),
        (QuestionReport, {"user_id": unlinked, "comment": ""}),
    ):
        await session.execute(
            update(model)
            .where(*scope(model))
            .values(values)
            .execution_options(synchronize_session=False)
        )


async def unlink_user(session: AsyncSession, user_id: str) -> None:
    """A deleted person: all they said about any question."""
    await unlink(session, lambda model: (model.user_id == user_id,))


async def unlink_candidates(
    session: AsyncSession, event_id: str, candidates: list[DeletedCandidate]
) -> None:
    """Each candidate's feedback on their interview's questions, and no other: every interview
    has its own question rows, a bank question's copy too, so what the same account said in
    another interview stays linked. Each event counts once: a redelivery finds it noted, and
    leaves alone what a candidate invited again has said since."""
    if not await processed_events.claim(session, ProcessedEvent, event_id):
        return

    pairs = [(candidate.user_id, candidate.set_id) for candidate in candidates]

    await unlink(
        session,
        lambda model: (
            model.question_id == Question.id,
            Question.topic_id == Topic.id,
            tuple_(model.user_id, Topic.set_id).in_(pairs),
        ),
    )


async def export(session: AsyncSession, user_id: str) -> dict:
    votes = await session.execute(
        select(Question.text, QuestionRating.value)
        .join(Question, Question.id == QuestionRating.question_id)
        .where(QuestionRating.user_id == user_id)
    )
    reports = await session.execute(
        select(
            Question.text,
            QuestionReport.reason,
            QuestionReport.comment,
            QuestionReport.created_at,
        )
        .join(Question, Question.id == QuestionReport.question_id)
        .where(QuestionReport.user_id == user_id)
    )

    # Kept after a reported question is replaced, so its current wording is what they're shown.
    reported = await session.scalars(
        select(Question.text)
        .join(QuestionReporter, QuestionReporter.question_id == Question.id)
        .where(QuestionReporter.user_id == user_id)
    )

    return {
        "question_votes": [{"question": text, "vote": value} for text, value in votes],
        "question_reports": [
            {"question": text, "reason": reason, "comment": comment, "at": at}
            for text, reason, comment, at in reports
        ],
        "questions_reported": list(reported),
    }
