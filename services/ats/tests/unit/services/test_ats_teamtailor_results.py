import asyncio
import uuid

import pytest

from ats.integrations import teamtailor
from ats.models.ats import AtsCandidate, AtsConnection
from ats.repositories import ats_results
from ats.services import ats as integrations
from ats.services import reports

SECRET = "signature-key"
INTERVIEW_ID = uuid.uuid4()


@pytest.fixture
def finished(monkeypatch):
    """A candidate Teamtailor sent who finished, and the notes recorded instead of sent."""
    connection = AtsConnection(
        id=uuid.uuid4(), provider="teamtailor", status="connected", member_id="5"
    )
    row = AtsCandidate(id=uuid.uuid4(), candidate_id="44", invite_id=uuid.uuid4())
    state = {"notes": [], "reported": [], "row": row, "connection": connection}

    async def for_invite(session, invite_id):
        return row, connection

    async def key(found):
        return {"host": "https://api.teamtailor.com", "key": "k", "webhook_secret": SECRET}

    async def comment(host, key, candidate_id, member, text):
        state["notes"].append((host, key, candidate_id, member, text))

    async def claim_report(session, row_id, data):
        return True

    async def mark_reported(session, row_id):
        state["reported"].append(row_id)

    monkeypatch.setattr(ats_results, "for_invite", for_invite)
    monkeypatch.setattr(ats_results, "claim", claim_report)
    monkeypatch.setattr(ats_results, "mark_reported", mark_reported)
    monkeypatch.setattr(integrations, "credentials", key)
    monkeypatch.setattr(teamtailor, "comment", comment)

    return state


def report(state):
    data = {
        "candidate_invite_id": str(state["row"].invite_id),
        "interview_id": str(INTERVIEW_ID),
        "company_id": str(uuid.uuid4()),
        "title": "Accountant",
        "grade": 82,
        "passed": True,
        "flagged": False,
    }
    asyncio.run(reports.report(data))


def test_results_go_back_to_teamtailor_as_a_note_by_the_member(finished):
    report(finished)

    [(host, key, candidate_id, member, text)] = finished["notes"]
    assert (host, key, candidate_id, member) == ("https://api.teamtailor.com", "k", "44", "5")
    assert "Grade: 82% (passed)" in text
    assert finished["reported"] == [finished["row"].id]


def test_without_a_teamtailor_user_to_write_as_nothing_goes_back(finished):
    finished["connection"].member_id = None
    report(finished)

    # Given up: marked, so it isn't tried again.
    assert finished["notes"] == [] and finished["reported"] == [finished["row"].id]
