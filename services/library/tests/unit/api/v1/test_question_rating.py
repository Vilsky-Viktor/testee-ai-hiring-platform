import uuid

import pytest
from fake_redis import FakeRedis
from testee_common.ai.ai_constants import LIMIT_HIT
from testee_common.http.http import bearer
from testee_common.limits.limit_list import LIMITS

from library.repositories import feedback
from tests.unit.api.v1.test_internal import token

QUESTION_ID = uuid.uuid4()


def fresh_auth():
    """Made per call: a service token lasts a minute."""
    return bearer(token(caller="companies"))


@pytest.fixture(autouse=True)
def redis(monkeypatch):
    """Rate limits count in memory."""
    fake = FakeRedis()
    monkeypatch.setattr("library.services.question_feedback.get_redis", lambda: fake)

    return fake


def test_a_candidate_rates_a_question_reads_it_back_and_takes_it_back(client, monkeypatch):
    stored = {}
    reviewed = []

    async def fake_rate(session, question_id, user_id, value):
        stored[user_id] = value

    async def fake_unrate(session, question_id, user_id):
        stored.pop(user_id, None)

    async def fake_mine(session, question_id, user_id):
        return stored.get(user_id)

    async def fake_review(question_id):
        reviewed.append(question_id)

    monkeypatch.setattr(feedback, "rate_question", fake_rate)
    monkeypatch.setattr(feedback, "unrate_question", fake_unrate)
    monkeypatch.setattr(feedback, "my_question_rating", fake_mine)
    monkeypatch.setattr("library.services.question_feedback.review", fake_review)
    url = f"/internal/questions/{QUESTION_ID}/rating"

    empty = client.get(url, params={"user_id": "ann"}, headers=fresh_auth())
    put = client.put(url, json={"user_id": "ann", "value": 1}, headers=fresh_auth())
    again = client.put(url, json={"user_id": "ann", "value": -1}, headers=fresh_auth())
    saved = client.get(url, params={"user_id": "ann"}, headers=fresh_auth())
    taken_back = client.delete(url, params={"user_id": "ann"}, headers=fresh_auth())
    after = client.get(url, params={"user_id": "ann"}, headers=fresh_auth())

    assert empty.json() == {"value": None}
    assert (put.status_code, again.status_code, taken_back.status_code) == (204, 204, 204)
    assert saved.json() == {"value": -1}
    assert after.json() == {"value": None}
    # Every vote, and one taken back, goes to the quality review, which may flag the question.
    assert reviewed == [QUESTION_ID] * 3


@pytest.mark.parametrize("edited", [None, 3])
def test_a_users_ratings_are_limited_a_day(client, monkeypatch, redis, published, edited):
    """At the limit's edited value, or its default when it isn't edited."""
    allowed = edited or LIMITS["RATINGS_PER_DAY"].default

    if edited:
        redis.limits["RATINGS_PER_DAY"] = str(edited)

    async def fake_rate(session, question_id, user_id, value):
        pass

    async def fake_review(question_id):
        pass

    monkeypatch.setattr(feedback, "rate_question", fake_rate)
    monkeypatch.setattr("library.services.question_feedback.review", fake_review)
    body = {"user_id": "voter", "value": 1}

    for _ in range(allowed):
        url = f"/internal/questions/{uuid.uuid4()}/rating"
        assert client.put(url, json=body, headers=fresh_auth()).status_code == 204

    url = f"/internal/questions/{uuid.uuid4()}/rating"
    assert client.put(url, json=body, headers=fresh_auth()).status_code == 429
    assert [(event, data["limit"], data["user_id"]) for event, data in published] == [
        (LIMIT_HIT, "RATINGS_PER_DAY", "voter")
    ]
