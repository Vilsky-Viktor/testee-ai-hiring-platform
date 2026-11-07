from datetime import UTC, datetime
from uuid import uuid4

import httpx
from testee_common.auth.auth import current_user
from testee_common.auth.user import User

from rounds.integrations import feedback
from rounds.main import app
from rounds.models.sessions import Session
from rounds.repositories import sessions

QUESTION_ID = uuid4()


def owned_session():
    return Session(
        id=uuid4(),
        user_id="cand",
        topic_id=uuid4(),
        interview_set_id=uuid4(),
        candidate_invite_id=uuid4(),
        topic_title="Python",
        status="in_progress",
        questions=[{"id": str(QUESTION_ID), "text": "What is the GIL?"}],
        started_at=datetime.now(UTC),
        answers=[],
    )


def test_candidate_rates_only_own_session_questions(client, monkeypatch):
    row = owned_session()
    calls = []

    async def fake_get(session, _session_id):
        return row

    async def fake_rate(question_id, user_id, value, previous):
        calls.append((question_id, user_id, value, previous))

        return httpx.Response(204, request=httpx.Request("PUT", "http://library"))

    monkeypatch.setattr(sessions, "get", fake_get)
    monkeypatch.setattr(feedback.client, "rate", fake_rate)
    base = f"/sessions/{row.id}/questions"
    app.dependency_overrides[current_user] = lambda: User(
        uid="eve", email="eve@example.com", email_verified=True
    )
    # Someone else's session.
    others = client.put(f"{base}/{QUESTION_ID}/rating", json={"value": 1})
    app.dependency_overrides[current_user] = lambda: User(
        uid="cand", email="cand@example.com", email_verified=True
    )
    # A question not in the candidate's own session, then one in it: a vote, switched, taken back.
    elsewhere = client.put(f"{base}/{uuid4()}/rating", json={"value": 1})
    bodies = [{"value": 1}, {"value": -1, "previous": 1}, {"value": None, "previous": -1}]
    own = [client.put(f"{base}/{QUESTION_ID}/rating", json=body) for body in bodies]

    app.dependency_overrides.clear()
    assert [others.status_code, elsewhere.status_code] == [404, 404]
    assert [response.status_code for response in own] == [204, 204, 204]
    assert calls == [
        (QUESTION_ID, "cand", 1, None),
        (QUESTION_ID, "cand", -1, 1),
        (QUESTION_ID, "cand", None, -1),
    ]


def test_the_librarys_daily_limit_reaches_the_candidate(client, monkeypatch):
    row = owned_session()

    async def fake_get(session, _session_id):
        return row

    async def fake_report(question_id, user_id, reason, comment):
        return httpx.Response(
            429,
            json={"detail": "Too many requests. Try again later."},
            request=httpx.Request("POST", "http://library"),
        )

    monkeypatch.setattr(sessions, "get", fake_get)
    monkeypatch.setattr(feedback.client, "report", fake_report)
    app.dependency_overrides[current_user] = lambda: User(
        uid="cand", email="cand@example.com", email_verified=True
    )

    response = client.post(
        f"/sessions/{row.id}/questions/{QUESTION_ID}/reports", json={"reason": "wrong_answer"}
    )

    app.dependency_overrides.clear()
    assert response.status_code == 429
    assert response.json() == {"detail": "Too many requests. Try again later."}
