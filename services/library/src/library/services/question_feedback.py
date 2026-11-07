import uuid

from testee_common.limits.rate_limit import hit_or_skip

from library.core.db import Session
from library.integrations.redis import get_redis
from library.repositories import bank, feedback
from library.services.quality import review


async def rate(
    question_id: uuid.UUID, user_id: str, value: int | None, previous: int | None
) -> None:
    """Changes the question's counts from the reader's `previous` vote to `value`, then reviews
    it. Feedback is anonymous: `user_id` only counts against their limit, which is all that
    stands between one person and many votes (with Redis down, not counted)."""
    key = f"rate:ratings:{user_id}"
    await hit_or_skip(get_redis(), key, "RATINGS_PER_DAY", user_id=user_id)

    async with Session.begin() as session:
        await feedback.change_rating(session, question_id, value, previous)

    await review(question_id)


async def report(question_id: uuid.UUID, user_id: str, reason: str, comment: str) -> None:
    """Saves the report, then reviews the question. Anonymous like a vote: `user_id` only counts
    against their limit (with Redis down, not counted)."""
    key = f"rate:reports:{user_id}"
    await hit_or_skip(get_redis(), key, "REPORTS_PER_DAY", user_id=user_id)

    async with Session.begin() as session:
        await feedback.report_question(session, question_id, reason, comment)

        # Reported, it leaves the shared bank for everyone, with what it's a copy of.
        await bank.leave(session, [question_id])

    await review(question_id)
