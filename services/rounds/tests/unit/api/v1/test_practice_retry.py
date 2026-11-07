"""An assistant action confirmed again after no answer: the same Idempotency-Key gets the round
the first request started, and no second one."""

from rounds.integrations import library
from rounds.repositories import practice_sessions, sessions
from tests.unit.api.v1.test_practice import TEMPLATE_ID, content, given_ids, signed_in  # noqa: F401


def test_a_round_started_again_with_its_key_is_the_first_round(client, redis, monkeypatch):
    saved = []

    async def fake_content(template_id):
        return content(14)

    async def fake_create(session, rows):
        given_ids(rows)
        saved.append(rows[0])

    async def fake_practiced(session, user_id, template_id):
        return False

    async def fake_get(session, session_id):
        return next(row for row in saved if row.id == session_id)

    monkeypatch.setattr(library, "practice_content", fake_content)
    monkeypatch.setattr(sessions, "add_all", fake_create)
    monkeypatch.setattr(sessions, "get", fake_get)
    monkeypatch.setattr(practice_sessions, "practiced", fake_practiced)

    headers = {"Idempotency-Key": "action-1"}
    first = client.post(f"/practice/{TEMPLATE_ID}", headers=headers)
    again = client.post(f"/practice/{TEMPLATE_ID}", headers=headers)

    assert first.status_code == again.status_code == 201
    assert first.json() == again.json()
    assert len(saved) == 1
