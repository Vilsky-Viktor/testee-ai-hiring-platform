"""The shared client of library's question feedback (rounds for candidates, companies for
members) and the vote and report it takes."""

import asyncio
import json
import uuid

import httpx
import pytest
from pydantic import ValidationError
from testee_common.auth.service_auth import token_caller
from testee_common.http import http
from testee_common.http.question_feedback import QuestionFeedback
from testee_common.http.question_feedback_schemas import RatingIn, ReportIn

SECRET = "library-secret-that-is-at-least-32-bytes"
QUESTION_ID = uuid.uuid4()


@pytest.fixture
def library(monkeypatch):
    """Library, answering each call with `answer` and keeping what it was asked."""
    monkeypatch.setenv("LIBRARY_SERVICE_SECRET", SECRET)
    asked = []
    answer = {"response": httpx.Response(204)}

    def handler(request):
        asked.append(request)

        return answer["response"]

    monkeypatch.setattr(
        http, "get_client", lambda: httpx.AsyncClient(transport=httpx.MockTransport(handler))
    )

    return asked, answer


@pytest.mark.parametrize(
    ("call", "method", "path", "body"),
    [
        ("rate", "PUT", "rating", {"user_id": "u1", "value": -1, "previous": 1}),
        (
            "report",
            "POST",
            "reports",
            {"user_id": "u1", "reason": "unclear", "comment": "Two answers fit"},
        ),
    ],
)
def test_each_call_reaches_librarys_route_as_the_caller(library, call, method, path, body):
    asked, _ = library
    client = QuestionFeedback("http://library", "companies")
    extra = {"rate": (-1, 1), "report": ("unclear", "Two answers fit")}[call]

    asyncio.run(getattr(client, call)(QUESTION_ID, "u1", *extra))

    [request] = asked
    token = request.headers["Authorization"].removeprefix("Bearer ")

    assert (request.method, request.url.path) == (
        method,
        f"/internal/questions/{QUESTION_ID}/{path}",
    )
    # Never in the address, which request logs record.
    assert not request.url.params
    assert json.loads(request.content) == body
    # Signed with library's key, from the service that made the client.
    assert token_caller(token, SECRET, "library") == "companies"


def test_librarys_answer_comes_back_as_it_is(library):
    _, answer = library
    answer["response"] = httpx.Response(429, json={"detail": "Too many reports today."})
    client = QuestionFeedback("http://library", "rounds")

    response = asyncio.run(client.report(QUESTION_ID, "u1", "unclear", ""))

    assert (response.status_code, response.json()) == (429, {"detail": "Too many reports today."})


def test_a_vote_is_a_thumbs_up_or_down_or_none():
    assert [RatingIn(value=value).value for value in (1, -1, None)] == [1, -1, None]
    assert RatingIn(value=None, previous=-1).previous == -1

    for value in (0, 2, -2):
        with pytest.raises(ValidationError):
            RatingIn(value=value)

        with pytest.raises(ValidationError):
            RatingIn(value=1, previous=value)


def test_a_reports_comment_may_be_left_out():
    assert ReportIn(reason="unclear").comment == ""

    with pytest.raises(ValidationError):
        ReportIn(comment="No reason")
