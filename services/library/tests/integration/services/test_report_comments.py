"""A report's comment is emptied a year after it was written, by the daily job; the report stays
(rule 11: a repeated run changes nothing, and another service's failure doesn't hold it back).
A deleted person's comments go sooner, with the link (test_user_data.py)."""

import uuid
from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import update

from library.constants.feedback import REPORT_COMMENT_KEEP_DAYS
from library.core.db import Session
from library.models.feedback import QuestionReport
from library.repositories import feedback
from library.services import housekeeping, quality
from tests.integration.factories import interview, question_ids
from tests.integration.transactions import transaction


async def report(question_id, user_id: str, age_days: float) -> None:
    await transaction(feedback.report_question, question_id, user_id, "other", "Ann wrote this.")

    async with Session.begin() as session:
        await session.execute(
            update(QuestionReport)
            .where(QuestionReport.question_id == question_id, QuestionReport.user_id == user_id)
            .values(created_at=datetime.now(UTC) - timedelta(days=age_days))
        )


async def comments(question_id) -> list[str]:
    reports = await transaction(feedback.list_reports, question_id)

    return [row.comment for row in reports]


def test_the_daily_job_empties_comments_past_the_limit_and_keeps_every_report(run):
    async def scenario():
        old, recent, _ = await question_ids(await interview(f"Aged {uuid.uuid4()}"))
        await report(old, f"user-{uuid.uuid4()}", REPORT_COMMENT_KEEP_DAYS + 1)
        await report(recent, f"user-{uuid.uuid4()}", REPORT_COMMENT_KEEP_DAYS - 1)
        await housekeeping.daily()

        return [await comments(question) for question in (old, recent)]

    assert run(scenario()) == [[""], ["Ann wrote this."]]


def test_a_repeated_run_empties_nothing_more(run):
    async def scenario():
        question, _, _ = await question_ids(await interview(f"Twice {uuid.uuid4()}"))
        await report(question, f"user-{uuid.uuid4()}", 2)
        before = datetime.now(UTC) - timedelta(days=1)
        await feedback.empty_old_comments(Session, before)

        return await comments(question), await feedback.empty_old_comments(Session, before)

    assert run(scenario()) == ([""], 0)


def test_another_services_failure_doesnt_hold_the_comments_back(run, monkeypatch):
    async def broken():
        raise RuntimeError("the verifier is down")

    monkeypatch.setattr(quality, "resend_stale_flags", broken)

    async def scenario():
        question, _, _ = await question_ids(await interview(f"Down {uuid.uuid4()}"))
        await report(question, f"user-{uuid.uuid4()}", REPORT_COMMENT_KEEP_DAYS + 1)

        with pytest.raises(RuntimeError):
            await housekeeping.daily()

        return await comments(question)

    assert run(scenario()) == [""]
