import asyncio
import uuid
from types import SimpleNamespace

import httpx
import pytest

from companies.constants.invites import InviteStatus
from companies.integrations import rounds
from companies.repositories import candidates
from companies.services import candidate_results, invite_pages

FINISHED_ID = uuid.uuid4()
RUNNING_ID = uuid.uuid4()


@pytest.fixture
def saved(monkeypatch):
    """The results stored, by invite id."""
    rows = {}

    async def fake_save(session, results):
        rows.update(results)

    monkeypatch.setattr(candidates, "save_results", fake_save)

    return rows


def test_a_finished_candidate_missing_their_grade_gets_it_stored(saved):
    stale = SimpleNamespace(id=FINISHED_ID, status=InviteStatus.FINISHED, grade=None, flagged=False)
    current = SimpleNamespace(id=RUNNING_ID, status=InviteStatus.FINISHED, grade=80, flagged=False)
    totals = {
        str(FINISHED_ID): {"grade": 100, "finished": True},
        str(RUNNING_ID): {"grade": 80, "finished": True},
    }

    asyncio.run(candidate_results.sync([stale, current], totals))

    # Rounds didn't answer when the first finished; the second's grade is already stored.
    assert saved == {FINISHED_ID: (100, False)}
    assert stale.grade == 100


def test_a_list_keeps_stored_grades_while_rounds_does_not_answer(monkeypatch):
    async def slow(invite_ids):
        raise httpx.ReadTimeout("slow")

    monkeypatch.setattr(rounds, "invite_scores", slow)
    graded = SimpleNamespace(id=FINISHED_ID, grade=80)
    running = SimpleNamespace(id=RUNNING_ID, grade=None)

    totals = asyncio.run(candidate_results.listed_totals([graded, running]))

    assert totals == {str(FINISHED_ID): {"grade": 80}}


def test_a_list_takes_rounds_results_when_it_answers(monkeypatch):
    async def scores(invite_ids):
        return {str(FINISHED_ID): {"grade": 91, "finished": True}}

    monkeypatch.setattr(rounds, "invite_scores", scores)
    stale = SimpleNamespace(id=FINISHED_ID, grade=80)

    totals = asyncio.run(candidate_results.listed_totals([stale]))

    assert totals == {str(FINISHED_ID): {"grade": 91, "finished": True}}


def test_a_candidates_page_opens_while_rounds_does_not_answer(monkeypatch):
    async def slow(invite_ids):
        raise httpx.ReadTimeout("slow")

    monkeypatch.setattr(rounds, "invite_scores", slow)
    invite = SimpleNamespace(id=RUNNING_ID, status=InviteStatus.IN_PROCESS)

    assert asyncio.run(invite_pages.progress_of(invite)) is None
