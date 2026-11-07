import uuid

import pytest
from fake_redis import FakeRedis
from testee_common.ai.ai_constants import LIMIT_HIT
from testee_common.http.http import bearer
from testee_common.limits.limit_list import LIMITS

from library.repositories import bank, feedback
from tests.unit.api.v1.test_internal import token

QUESTION_ID = uuid.uuid4()
AUTH = bearer(token())


@pytest.fixture(autouse=True)
def redis(monkeypatch):
    """Rate limits count in memory."""
    fake = FakeRedis()
    monkeypatch.setattr("library.services.question_feedback.get_redis", lambda: fake)

    return fake


@pytest.fixture(autouse=True)
def left_bank(monkeypatch):
    """The questions a report took out of the shared bank."""
    left = []

    async def fake_leave(session, question_ids):
        left.extend(question_ids)

    monkeypatch.setattr(bank, "leave", fake_leave)

    return left


def test_each_report_counts_and_leaves_no_trace_of_who_made_it(client, monkeypatch, left_bank):
    saved = []

    async def fake_report(session, question_id, reason, comment):
        saved.append((question_id, reason, comment))

    async def fake_review(question_id):
        pass

    monkeypatch.setattr(feedback, "report_question", fake_report)
    monkeypatch.setattr("library.services.question_feedback.review", fake_review)
    url = f"/internal/questions/{QUESTION_ID}/reports"
    body = {"user_id": "ann", "reason": "unclear", "comment": "Two answers fit"}

    assert client.post(url, json=body, headers=AUTH).status_code == 201
    # Nothing can tell it's the same person: only their limit counts it.
    assert client.post(url, json=body, headers=AUTH).status_code == 201
    assert saved == [(QUESTION_ID, "unclear", "Two answers fit")] * 2
    assert left_bank == [QUESTION_ID] * 2


def test_a_question_reported_as_hard_to_read_is_saved_with_that_reason(client, monkeypatch):
    saved = []

    async def fake_report(session, question_id, reason, comment):
        saved.append((question_id, reason))

    async def fake_review(question_id):
        pass

    monkeypatch.setattr(feedback, "report_question", fake_report)
    monkeypatch.setattr("library.services.question_feedback.review", fake_review)
    url = f"/internal/questions/{QUESTION_ID}/reports"
    body = {"user_id": "ann", "reason": "hard_to_read"}

    assert client.post(url, json=body, headers=AUTH).status_code == 201
    assert saved == [(QUESTION_ID, "hard_to_read")]


@pytest.mark.parametrize("edited", [None, 2])
def test_a_users_reports_are_limited_a_day(client, monkeypatch, redis, published, edited):
    """At the limit's edited value, or its default when it isn't edited."""
    allowed = edited or LIMITS["REPORTS_PER_DAY"].default

    if edited:
        redis.limits["REPORTS_PER_DAY"] = str(edited)

    async def fake_report(session, question_id, reason, comment):
        pass

    async def fake_review(question_id):
        pass

    monkeypatch.setattr(feedback, "report_question", fake_report)
    monkeypatch.setattr("library.services.question_feedback.review", fake_review)
    body = {"user_id": "spammer", "reason": "unclear"}

    for _ in range(allowed):
        url = f"/internal/questions/{uuid.uuid4()}/reports"
        assert client.post(url, json=body, headers=AUTH).status_code == 201

    url = f"/internal/questions/{uuid.uuid4()}/reports"
    assert client.post(url, json=body, headers=AUTH).status_code == 429
    assert [(event, data["limit"], data["user_id"]) for event, data in published] == [
        (LIMIT_HIT, "REPORTS_PER_DAY", "spammer")
    ]
