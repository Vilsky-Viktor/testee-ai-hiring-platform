"""Question feedback against the real database: counts with no person behind them, nothing saved
that names who gave it, the daily job that empties old comments, and the wait after a fix that
keeps repeat feedback from sending a question to the verifier again and again."""

import asyncio
import os
import uuid
from datetime import UTC, datetime, timedelta

from alembic import command
from alembic.config import Config
from sqlalchemy import select, text, update
from testee_common.db.lock_waits import HeldCommit, race

from library.constants.feedback import REPORT_COMMENT_KEEP_DAYS
from library.constants.quality import FEEDBACK_REST_DAYS, QualityFlag
from library.core.db import Session
from library.integrations.redis import get_redis
from library.models.feedback import QuestionReport
from library.models.quality import QuestionRevision
from library.repositories import feedback, preparations
from library.services import housekeeping, question_feedback
from library.services import questions as question_service
from library.services.quality import save_review
from tests.integration.factories import interview
from tests.integration.transactions import transaction

OPTIONS = [{"answer": "Yes", "correct": True}, {"answer": "No", "correct": False}]


async def a_question():
    set_id = await interview(f"Feedback {uuid.uuid4()}", questions=1)

    return (await transaction(preparations.get_content, set_id)).topics[0].questions[0]


async def counts(question_id):
    stats = await transaction(feedback.question_stats, [question_id])

    return stats.get(question_id)


def test_votes_move_the_counts_which_never_go_below_nothing(run):
    async def scenario():
        question = await a_question()
        seen = []

        # A like, a dislike, one switched, one taken back, one taken back that isn't there.
        for value, previous in ((1, None), (-1, None), (-1, 1), (None, -1), (None, 1)):
            await transaction(feedback.change_rating, question.id, value, previous)
            found = await counts(question.id)
            seen.append((found["likes"], found["dislikes"]))

        return seen

    assert run(scenario()) == [(1, 0), (1, 1), (0, 2), (0, 1), (0, 1)]


def test_votes_at_the_same_moment_both_count(run, monkeypatch):
    async def scenario():
        question = await a_question()
        await transaction(feedback.change_rating, question.id, 1, None)
        monkeypatch.setattr(question_feedback, "review", lambda _question_id: asyncio.sleep(0))
        held = HeldCommit(Session)
        monkeypatch.setattr(question_feedback, "Session", held)
        await race(
            os.environ["DATABASE_URL"],
            held,
            question_feedback.rate(question.id, "one", 1, None),
            question_feedback.rate(question.id, "two", 1, None),
        )

        return await counts(question.id)

    assert run(scenario())["likes"] == 3


def test_nothing_saved_says_who_gave_feedback(run):
    reader = f"person-{uuid.uuid4()}"

    async def scenario():
        question, replaced = await a_question(), await a_question()

        for target in (question, replaced):
            await question_feedback.rate(target.id, reader, -1, None)
            await question_feedback.report(target.id, reader, "unclear", "Two answers fit.")

        # What's kept of a replaced question's feedback, too.
        await question_service.replace(replaced.id, "Clearer?", OPTIONS)

        async with Session() as session:
            tables = await session.scalars(
                text(
                    "SELECT table_name FROM information_schema.tables "
                    "WHERE table_schema = 'public' AND table_type = 'BASE TABLE'"
                )
            )
            tables = list(tables)
            holders = [
                table
                for table in tables
                if await session.scalar(
                    text(f'SELECT count(*) FROM "{table}" t WHERE t::text LIKE :reader'),
                    {"reader": f"%{reader}%"},
                )
            ]
            columns = await session.scalars(
                text(
                    "SELECT column_name FROM information_schema.columns "
                    "WHERE table_name IN ('question_ratings', 'question_reports')"
                )
            )
            columns = set(columns)

        limits = [key async for key in get_redis().scan_iter(f"*{reader}*")]

        return tables, holders, columns, limits

    tables, holders, columns, limits = run(scenario())

    # Not in any table of library's, not a table of who reported, no column for a person.
    assert holders == []
    assert "question_reporters" not in tables
    assert columns == {"question_id", "company_id", "likes", "dislikes"} | {
        "id",
        "reason",
        "comment",
        "status",
        "created_at",
    }
    # Their limits' counters know them, and no question.
    assert sorted(limits) == [f"rate:ratings:{reader}".encode(), f"rate:reports:{reader}".encode()]


def test_the_migration_adds_votes_up_and_keeps_reports_without_their_users(run):
    """Rows as the old schema held them: votes by person, and a report with its user's id."""

    async def setup():
        return await a_question(), await a_question()

    async def old_rows(mixed, one_vote):
        votes = [(mixed, "ann", 1), (mixed, "bob", 1), (mixed, "cid", -1), (one_vote, "ann", -1)]

        async with Session.begin() as session:
            for question_id, user_id, value in votes:
                await session.execute(
                    text(
                        "INSERT INTO question_ratings (question_id, user_id, value) "
                        "VALUES (:question_id, :user_id, :value)"
                    ),
                    {"question_id": question_id, "user_id": user_id, "value": value},
                )

            await session.execute(
                text(
                    "INSERT INTO question_reports "
                    "(id, question_id, user_id, reason, comment, status) VALUES "
                    "(gen_random_uuid(), :question_id, 'ann', 'unclear', 'Two fit.', 'open')"
                ),
                {"question_id": mixed},
            )

    async def migrated(mixed, one_vote):
        async with Session() as session:
            companies = await session.execute(
                text(
                    "SELECT r.company_id, q.company_id FROM question_ratings r "
                    "JOIN questions q ON q.id = r.question_id WHERE r.question_id = :id"
                ),
                {"id": mixed},
            )
            reports = await session.execute(
                select(QuestionReport.reason, QuestionReport.comment).where(
                    QuestionReport.question_id == mixed
                )
            )

            return (
                await counts(mixed),
                await counts(one_vote),
                [tuple(row) for row in companies],
                [tuple(row) for row in reports],
            )

    mixed, one_vote = run(setup())
    config = Config("alembic.ini")
    command.downgrade(config, "0041")
    run(old_rows(mixed.id, one_vote.id))
    command.upgrade(config, "head")
    both, single, companies, reports = run(migrated(mixed.id, one_vote.id))

    assert (both["likes"], both["dislikes"], both["reports"]) == (2, 1, 1)
    assert (single["likes"], single["dislikes"]) == (0, 1)
    # Filled again from the question, as the trigger does for every new row.
    assert [company for company, _ in companies] == [mixed.company_id]
    assert companies[0][1] == mixed.company_id
    assert reports == [("unclear", "Two fit.")]


def test_the_same_person_reporting_twice_makes_two_reports(run):
    async def scenario():
        question = await a_question()

        for _ in range(2):
            await question_feedback.report(question.id, "same-reader", "unclear", "")

        return (await counts(question.id))["reports"]

    assert run(scenario()) == 2


async def a_report(question_id, comment, days_old):
    async with Session.begin() as session:
        report = QuestionReport(
            question_id=question_id,
            reason="unclear",
            comment=comment,
            created_at=datetime.now(UTC) - timedelta(days=days_old),
        )
        session.add(report)

    return report.id


def test_the_daily_job_empties_old_comments_and_keeps_the_reports(run):
    async def scenario():
        question = await a_question()
        old = await a_report(question.id, "Ann Smith wrote this", REPORT_COMMENT_KEEP_DAYS + 1)
        recent = await a_report(question.id, "Still kept", REPORT_COMMENT_KEEP_DAYS - 1)

        # Twice: a run that finds nothing left to do changes nothing.
        for _ in range(2):
            await housekeeping.daily()

        async with Session() as session:
            rows = await session.execute(
                select(QuestionReport.id, QuestionReport.comment, QuestionReport.reason).where(
                    QuestionReport.question_id == question.id
                )
            )

            return old, recent, {row[0]: (row[1], row[2]) for row in rows}

    old, recent, found = run(scenario())

    assert found == {old: ("", "unclear"), recent: ("Still kept", "unclear")}


async def report_twice(question_id):
    """Two wrong answer reports: enough to flag, and they may be one person's."""
    for _ in range(2):
        await transaction(feedback.report_question, question_id, "wrong_answer", "")


async def age_revisions(question_id, days):
    async with Session.begin() as session:
        await session.execute(
            update(QuestionRevision)
            .where(QuestionRevision.question_id == question_id)
            .values(replaced_at=datetime.now(UTC) - timedelta(days=days))
        )


def test_a_fixed_questions_feedback_flags_it_only_after_the_wait(run):
    async def scenario():
        question = await a_question()
        await report_twice(question.id)
        first = await save_review(question.id)
        await question_service.replace(question.id, "Fixed?", OPTIONS)

        await report_twice(question.id)
        await transaction(feedback.change_rating, question.id, -1, None)
        resting = await save_review(question.id)
        await age_revisions(question.id, FEEDBACK_REST_DAYS + 1)
        after = await save_review(question.id)

        return first, resting, after

    first, resting, after = run(scenario())

    assert first == (QualityFlag.WRONG_KEY, True)
    # Fixed moments ago: the same people's feedback doesn't send it back.
    assert resting is None
    # Not lost: what was reported meanwhile counts once the wait is over.
    assert after == (QualityFlag.WRONG_KEY, True)


def test_an_owners_edit_of_an_unflagged_question_starts_no_wait(run):
    async def scenario():
        question = await a_question()
        await question_service.replace(question.id, "Edited?", OPTIONS)
        await report_twice(question.id)

        return await save_review(question.id)

    assert run(scenario()) == (QualityFlag.WRONG_KEY, True)
