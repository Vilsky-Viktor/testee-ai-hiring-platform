"""A deleted person's votes and reports stay for the questions' quality, with nothing left that
points back to them, however they went: accounts' `user.deleted`, or companies' `guests.deleted`
for a guest removed, reaching the 12-month retention or going with its interview or company
(companies' test_guest_events.py proves each of those announces it)."""

import hashlib
import re
import uuid

import pytest
from sqlalchemy import text

from library.core.db import Session
from library.handlers.dispatch import handle
from library.repositories import feedback, user_data
from tests.integration.factories import interview, question_ids
from tests.integration.transactions import transaction

UNLINKED = re.compile(
    r"unlinked-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}"
)


def account_event(user_id: str) -> tuple:
    return "user.deleted", {"user_id": user_id, "email": "ann@example.com"}


def guest_event(user_id: str) -> tuple:
    return "guests.deleted", {"user_ids": [user_id]}


async def rows(*question_ids_) -> dict[str, list]:
    """Each feedback table's whole rows on the questions, as text."""
    found = {}

    async with Session() as session:
        for table in ("question_ratings", "question_reports", "question_reporters"):
            query = f"SELECT row_to_json(t)::text FROM {table} t WHERE question_id = ANY(:ids)"
            result = await session.scalars(text(query), {"ids": list(question_ids_)})
            found[table] = sorted(result)

    return found


async def voted_and_reported(user_id: str):
    set_id = await interview(f"Ledgers {uuid.uuid4()}")
    first, second, third = await question_ids(set_id)
    await transaction(feedback.rate_question, first, user_id, -1)
    await transaction(feedback.rate_question, second, user_id, 1)
    await transaction(feedback.report_question, second, user_id, "unclear", "Two answers fit.")
    await transaction(feedback.report_question, third, user_id, "off_topic", "")

    return first, second, third


@pytest.mark.parametrize(
    "prefix, event", [("user-", account_event), ("guest-", guest_event)], ids=["account", "guest"]
)
def test_a_deleted_persons_feedback_stays_with_nothing_that_points_back(run, prefix, event):
    gone, stays = f"{prefix}{uuid.uuid4()}", f"user-{uuid.uuid4()}"

    async def scenario():
        first, second, third = await voted_and_reported(gone)
        await transaction(feedback.rate_question, first, stays, 1)
        await transaction(feedback.report_question, second, stays, "unclear", "Same here.")
        ids = [first, second, third]
        exported = await transaction(user_data.export, gone)
        stats = await transaction(feedback.question_stats, ids)
        await handle(str(uuid.uuid4()), *event(gone))
        after = await rows(*ids)
        # Delivered again: it finds nothing and changes nothing.
        await handle(str(uuid.uuid4()), *event(gone))

        return (
            exported,
            stats,
            after,
            await rows(*ids),
            await transaction(feedback.question_stats, ids),
            await transaction(user_data.export, gone),
            await transaction(user_data.export, stays),
            await transaction(feedback.mine, ids, gone),
            await transaction(feedback.list_reports, second),
        )

    exported, stats, after, redelivered, stats_after, export_after, kept, mine, reports = run(
        scenario()
    )

    assert len(exported["question_votes"]) == 2
    assert len(exported["question_reports"]) == len(exported["questions_reported"]) == 2
    # The feedback still counts, and a report keeps its reason; its author's comment goes, as it
    # can name them, and only theirs.
    assert stats_after == stats
    assert sorted(report.comment for report in reports) == ["", "Same here."]
    assert sorted(report.reason for report in reports) == ["unclear", "unclear"]
    # No id, and none of the ways to hash it, in any column of any row.
    dump = str(after)
    traces = [
        gone,
        hashlib.md5(gone.encode()).hexdigest(),  # noqa: S324
        hashlib.sha1(gone.encode()).hexdigest(),  # noqa: S324
        hashlib.sha256(gone.encode()).hexdigest(),
    ]
    assert not [trace for trace in traces + ["Two answers fit."] if trace in dump]
    # The reporter's note goes with its person; the other reporter's stays.
    assert [stays in row for row in after["question_reporters"]] == [True]
    assert redelivered == after
    assert export_after == {"question_votes": [], "question_reports": [], "questions_reported": []}
    assert mine == ({}, set())
    assert len(kept["question_votes"]) == len(kept["question_reports"]) == 1


def test_the_values_left_are_random_new_to_each_row_and_never_the_same_twice(run):
    """Unlinking the same id on the same rows twice gives other values, so they are no function
    of it, and no two rows of a person share one, so none joins them to the other."""
    gone = f"user-{uuid.uuid4()}"

    async def left(ids) -> list[str]:
        query = (
            "SELECT user_id FROM question_ratings WHERE question_id = ANY(:ids) "
            "UNION ALL SELECT user_id FROM question_reports WHERE question_id = ANY(:ids)"
        )

        async with Session() as session:
            return list(await session.scalars(text(query), {"ids": ids}))

    async def scenario():
        first_run = await voted_and_reported(gone)
        await handle(str(uuid.uuid4()), *account_event(gone))
        second_run = await voted_and_reported(gone)
        await handle(str(uuid.uuid4()), *account_event(gone))

        return await left(list(first_run)), await left(list(second_run))

    first_values, second_values = run(scenario())
    values = first_values + second_values

    assert len(values) == len(set(values)) == 8
    assert all(UNLINKED.fullmatch(value) for value in values)


def test_a_reports_unique_constraint_holds_and_the_question_can_be_reported_again(run):
    one, two, new = (f"guest-{uuid.uuid4()}" for _ in "abc")

    async def scenario():
        question, _, _ = await question_ids(await interview(f"Twice {uuid.uuid4()}"))

        for person in (one, two):
            await transaction(feedback.report_question, question, person, "unclear", "")
            await handle(str(uuid.uuid4()), *guest_event(person))

        reported = await transaction(feedback.report_question, question, new, "unclear", "")

        return reported, await transaction(feedback.list_reports, question)

    reported, reports = run(scenario())

    assert reported is True
    assert len(reports) == 3


def test_a_failure_halfway_keeps_everything_and_the_redelivery_finishes(run, monkeypatch):
    gone = f"user-{uuid.uuid4()}"

    async def scenario():
        first, second, third = await voted_and_reported(gone)
        # Too long for the column: the save fails after the reporter's note has gone.
        monkeypatch.setattr(user_data, "UNLINKED_USER_PREFIX", "x" * 200)

        with pytest.raises(Exception, match="too long"):
            await handle(str(uuid.uuid4()), *account_event(gone))

        monkeypatch.undo()
        failed = await transaction(feedback.mine, [first, second, third], gone)
        await handle(str(uuid.uuid4()), *account_event(gone))

        expected = ({first: -1, second: 1}, {second, third})

        return expected, failed, await transaction(feedback.mine, [first, second, third], gone)

    expected, failed, finished = run(scenario())

    assert failed == expected
    assert finished == ({}, set())
