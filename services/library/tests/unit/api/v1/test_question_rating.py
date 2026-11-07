import uuid

import pytest
from fake_redis import FakeRedis
from testee_common.ai.ai_constants import LIMIT_HIT
from testee_common.http.http import bearer
from testee_common.limits.limit_list import LIMITS

from library.repositories import feedback
from tests.unit.api.v1.test_internal import token

QUESTION_ID = uuid.uuid4()
AUTH = bearer(token())


@pytest.fixture(autouse=True)
def redis(monkeypatch):
    """Rate limits count in memory."""
    fake = FakeRedis()
    monkeypatch.setattr("library.services.question_feedback.get_redis", lambda: fake)

    return fake


def test_each_vote_moves_the_counts_and_goes_to_the_review(client, monkeypatch):
    moved = []
    reviewed = []

    async def fake_change(session, question_id, value, previous):
        moved.append((question_id, value, previous))

    async def fake_review(question_id):
        reviewed.append(question_id)

    monkeypatch.setattr(feedback, "change_rating", fake_change)
    monkeypatch.setattr("library.services.question_feedback.review", fake_review)
    url = f"/internal/questions/{QUESTION_ID}/rating"
    votes = [(1, None), (-1, 1), (None, -1)]

    for value, previous in votes:
        body = {"user_id": "ann", "value": value, "previous": previous}
        assert client.put(url, json=body, headers=AUTH).status_code == 204

    # The repository is never given who voted.
    assert moved == [(QUESTION_ID, value, previous) for value, previous in votes]
    # Every vote, and one taken back, goes to the quality review, which may flag the question.
    assert reviewed == [QUESTION_ID] * 3


def test_only_a_thumbs_up_or_down_or_none_is_a_vote(client):
    url = f"/internal/questions/{QUESTION_ID}/rating"

    assert client.put(url, json={"user_id": "ann", "value": 2}, headers=AUTH).status_code == 422


@pytest.mark.parametrize("edited", [None, 3])
def test_a_users_ratings_are_limited_a_day(client, monkeypatch, redis, published, edited):
    """At the limit's edited value, or its default when it isn't edited."""
    allowed = edited or LIMITS["RATINGS_PER_DAY"].default

    if edited:
        redis.limits["RATINGS_PER_DAY"] = str(edited)

    async def fake_change(session, question_id, value, previous):
        pass

    async def fake_review(question_id):
        pass

    monkeypatch.setattr(feedback, "change_rating", fake_change)
    monkeypatch.setattr("library.services.question_feedback.review", fake_review)
    body = {"user_id": "voter", "value": 1}
    # One question: nothing tells a person's second vote on it from another's.
    url = f"/internal/questions/{QUESTION_ID}/rating"

    for _ in range(allowed):
        assert client.put(url, json=body, headers=AUTH).status_code == 204

    assert client.put(url, json=body, headers=AUTH).status_code == 429
    assert [(event, data["limit"], data["user_id"]) for event, data in published] == [
        (LIMIT_HIT, "RATINGS_PER_DAY", "voter")
    ]
