import os
import uuid
from datetime import timedelta

from sqlalchemy import func, update
from testee_common.db.lock_waits import hold_first_commit, race

from rounds.constants.integrity import MIN_TAB_LEAVE_SECONDS
from rounds.models.signals import Signal
from rounds.repositories import sessions, signals
from rounds.services import invite_scores
from tests.integration import transactions
from tests.integration.factories import MOST_SIGNALS, created, topic
from tests.integration.transactions import transaction


async def aged(session, session_id):
    """As if the session's signals began just past the shortest leave that counts."""
    await session.execute(
        update(Signal)
        .where(Signal.session_id == session_id)
        .values(created_at=func.now() - timedelta(seconds=MIN_TAB_LEAVE_SECONDS))
    )


def test_signals_are_saved_with_their_question_and_loaded_for_the_scorecard(run):
    invite_id = uuid.uuid4()

    async def scenario():
        [row] = await created("cand", invite_id, [topic()], 60, company_id=uuid.uuid4())
        question_id = uuid.UUID(row.questions[0]["id"])
        await transaction(signals.add_signal, row.id, question_id, "tab_leave", MOST_SIGNALS)
        await transaction(signals.add_signal, row.id, None, "copy", MOST_SIGNALS)

        return await transaction(sessions.list_for_invite, invite_id, signals=True), question_id

    [row], question_id = run(scenario())

    assert sorted((signal.kind, signal.question_id) for signal in row.signals) == [
        ("copy", None),
        ("tab_leave", question_id),
    ]


def test_a_return_drops_only_a_leave_that_began_under_two_seconds_ago(run):
    invite_id = uuid.uuid4()

    async def scenario():
        [row] = await created("cand", invite_id, [topic(2)], 60, company_id=uuid.uuid4())
        await transaction(signals.add_signal, row.id, None, "copy", MOST_SIGNALS)
        await transaction(signals.add_signal, row.id, None, "tab_leave", MOST_SIGNALS)
        await transaction(aged, row.id)
        # A return after a long leave keeps it.
        await transaction(signals.drop_short_leave, row.id)
        await transaction(signals.add_signal, row.id, None, "tab_leave", MOST_SIGNALS)
        # A moment's leave goes.
        await transaction(signals.drop_short_leave, row.id)
        # A return with nothing left to drop changes nothing.
        await transaction(signals.drop_short_leave, row.id)
        # A leave never returned from counts.
        await transaction(signals.add_signal, row.id, None, "tab_leave", MOST_SIGNALS)
        [found] = await transaction(sessions.list_for_invite, invite_id, signals=True)

        return found, await invite_scores.scores([invite_id])

    found, scores = run(scenario())

    assert sorted(signal.kind for signal in found.signals) == ["copy", "tab_leave", "tab_leave"]
    assert scores[invite_id]["tab_leaves"] == 2


def test_signals_sent_at_once_still_stop_at_the_limit(run, monkeypatch):
    invite_id = uuid.uuid4()
    most = MOST_SIGNALS

    async def scenario():
        [row] = await created("cand", invite_id, [topic()], 30, company_id=uuid.uuid4())
        question_id = uuid.UUID(row.questions[0]["id"])

        for _ in range(most - 1):
            await transaction(signals.add_signal, row.id, question_id, "tab_leave", MOST_SIGNALS)

        # The last place: the second waits on the question's lock until the first commits.
        held = hold_first_commit(monkeypatch, transactions)
        await race(
            os.environ["DATABASE_URL"],
            held,
            *(
                transaction(signals.add_signal, row.id, question_id, "tab_leave", most)
                for _ in range(2)
            ),
        )
        [found] = await transaction(sessions.list_for_invite, invite_id, signals=True)

        return len(found.signals)

    assert run(scenario()) == most
