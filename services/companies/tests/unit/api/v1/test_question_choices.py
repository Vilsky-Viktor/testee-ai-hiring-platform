"""A member's say on an interview's questions: owners and admins leave one out or bring it back;
every member likes, dislikes or reports one, passed on to library."""

import uuid
from datetime import UTC, datetime

import httpx
import pytest
from testee_common.auth.auth import current_user
from testee_common.auth.user import User
from testee_common.events.audit_actions import AuditAction, TargetKind

from companies.integrations import library
from companies.integrations.question_feedback import client as feedback
from companies.main import app
from companies.models.companies import Company, Member
from companies.models.interviews import Interview
from companies.repositories import companies, excluded_questions, interviews

COMPANY_ID = uuid.uuid4()
INTERVIEW_ID = uuid.uuid4()
TOPIC_ID = uuid.uuid4()
OTHER_TOPIC = uuid.uuid4()
SET_ID = uuid.uuid4()
QUESTIONS = [uuid.uuid4() for _ in range(3)]


@pytest.fixture
def member(monkeypatch):
    """Bob, with `role`, in a company (or, with `team`, someone else's company) with an interview whose topic has 3 questions (and, with
    `other_topic`, a second topic of 5); what a change leaves out becomes the interview's."""

    def sign_in(role, excluded=None, other_topic=False, team="bob"):
        app.dependency_overrides[current_user] = lambda: User(
            uid="bob", email="bob@example.com", email_verified=True, name="Bob"
        )
        interview = Interview(
            id=INTERVIEW_ID,
            company_id=COMPANY_ID,
            generation_id=uuid.uuid4(),
            set_id=SET_ID,
            topic_limits={},
            excluded_questions=dict(excluded or {}),
        )
        company = Company(id=COMPANY_ID, name="Acme", created_at=datetime.now(UTC))
        company.members = [
            Member(
                company_id=COMPANY_ID,
                user_id=team,
                invited_email=f"{team}@example.com",
                role=role,
                created_at=datetime.now(UTC),
            )
        ]
        topics = [{"id": str(TOPIC_ID), "title": "SQL", "question_count": 3}]
        topics += [{"id": str(OTHER_TOPIC), "title": "Git", "question_count": 5}] * other_topic

        async def fake_interview(session, _interview_id):
            return interview

        async def fake_company(session, _company_id):
            return company

        async def fake_questions(set_id, topic_id, user_id=None):
            if set_id != SET_ID or topic_id != TOPIC_ID:
                return None

            return [{"id": str(question)} for question in QUESTIONS]

        async def fake_set(_set_id):
            return {"topics": topics}

        async def fake_change(session, _interview_id, change):
            interview.excluded_questions = change(
                interview.excluded_questions, interview.topic_limits
            )

        monkeypatch.setattr(interviews, "get", fake_interview)
        monkeypatch.setattr(companies, "get", fake_company)
        monkeypatch.setattr(library, "get_topic_questions", fake_questions)
        monkeypatch.setattr(library, "get_set", fake_set)
        monkeypatch.setattr(excluded_questions, "change", fake_change)

        return interview

    yield sign_in
    app.dependency_overrides.clear()


def excluded_url(question_id=QUESTIONS[0], topic_id=TOPIC_ID):
    return f"/interviews/{INTERVIEW_ID}/topics/{topic_id}/questions/{question_id}/excluded"


@pytest.mark.parametrize("role", ["owner", "admin"])
def test_an_editor_leaves_a_question_out_and_brings_it_back(client, member, audited, role):
    interview = member(role)

    left_out = client.put(excluded_url(), json={"excluded": True})
    excluded = dict(interview.excluded_questions)
    # Leaving it out twice keeps one.
    client.put(excluded_url(), json={"excluded": True})
    twice = dict(interview.excluded_questions)
    back = client.put(excluded_url(), json={"excluded": False})

    assert (left_out.status_code, back.status_code) == (204, 204)
    assert excluded == twice == {str(TOPIC_ID): [str(QUESTIONS[0])]}
    assert interview.excluded_questions == {}
    assert [event[1:] for event in audited] == [
        ("bob", AuditAction.INTERVIEW_SETTINGS_CHANGED, INTERVIEW_ID, TargetKind.INTERVIEW)
    ] * 3


def test_a_viewer_leaves_nothing_out(client, member):
    interview = member("viewer")

    assert client.put(excluded_url(), json={"excluded": True}).status_code == 403
    assert interview.excluded_questions == {}


@pytest.mark.parametrize(
    ("question_id", "topic_id"),
    [(uuid.uuid4(), TOPIC_ID), (QUESTIONS[0], uuid.uuid4())],
    ids=["question not in the topic", "topic not in the interview"],
)
def test_a_question_not_in_the_topic_is_not_found(client, member, question_id, topic_id):
    interview = member("owner")
    response = client.put(excluded_url(question_id, topic_id), json={"excluded": True})

    assert response.status_code == 404
    assert interview.excluded_questions == {}


def test_the_last_question_left_cannot_be_left_out(client, member):
    others = [str(question) for question in QUESTIONS[1:]]
    interview = member("owner", excluded={str(TOPIC_ID): others})

    response = client.put(excluded_url(), json={"excluded": True})

    assert response.status_code == 422
    assert response.json()["detail"] == "An interview needs at least one topic with questions."
    assert interview.excluded_questions == {str(TOPIC_ID): others}


def test_a_topics_last_question_goes_while_another_topic_has_some(client, member):
    others = [str(question) for question in QUESTIONS[1:]]
    interview = member("owner", excluded={str(TOPIC_ID): others}, other_topic=True)

    assert client.put(excluded_url(), json={"excluded": True}).status_code == 204
    assert sorted(interview.excluded_questions[str(TOPIC_ID)]) == sorted(
        [*others, str(QUESTIONS[0])]
    )


def feedback_calls(monkeypatch, answer=None):
    """Library's feedback routes, recorded; each answers `answer` (204 by default)."""
    calls = []

    def recorded(name):
        async def call(*args):
            calls.append((name, *args))

            return answer or httpx.Response(204)

        return call

    for name in ("rate", "unrate", "report"):
        monkeypatch.setattr(feedback, name, recorded(name))

    return calls


def in_set(set_id):
    async def context(_question_id):
        return {"set_id": str(set_id)}

    return context


QUESTION = QUESTIONS[0]
FEEDBACK_ROUTES = [
    ("put", f"/interviews/{INTERVIEW_ID}/questions/{QUESTION}/rating", {"value": -1}),
    ("delete", f"/interviews/{INTERVIEW_ID}/questions/{QUESTION}/rating", None),
    (
        "post",
        f"/interviews/{INTERVIEW_ID}/questions/{QUESTION}/reports",
        {"reason": "unclear", "comment": "Two right answers"},
    ),
]


def test_every_member_rates_takes_back_and_reports_the_interviews_questions(
    client, member, monkeypatch
):
    member("viewer")
    calls = feedback_calls(monkeypatch)
    monkeypatch.setattr(library, "get_question_context", in_set(SET_ID))

    statuses = [
        client.request(m.upper(), url, json=body).status_code for m, url, body in FEEDBACK_ROUTES
    ]

    assert statuses == [204, 204, 204]
    assert calls == [
        ("rate", QUESTION, "bob", -1),
        ("unrate", QUESTION, "bob"),
        ("report", QUESTION, "bob", "unclear", "Two right answers"),
    ]


@pytest.mark.parametrize(("method", "url", "body"), FEEDBACK_ROUTES)
def test_a_question_of_another_interview_is_not_found(
    client, member, monkeypatch, method, url, body
):
    member("owner")
    calls = feedback_calls(monkeypatch)
    monkeypatch.setattr(library, "get_question_context", in_set(uuid.uuid4()))

    assert client.request(method.upper(), url, json=body).status_code == 404
    assert calls == []


@pytest.mark.parametrize(("method", "url", "body"), FEEDBACK_ROUTES)
def test_a_member_of_another_company_is_refused(client, member, monkeypatch, method, url, body):
    # Bob signs in; the interview's company has only Eve.
    member("owner", team="eve")
    calls = feedback_calls(monkeypatch)
    monkeypatch.setattr(library, "get_question_context", in_set(SET_ID))

    assert client.request(method.upper(), url, json=body).status_code in (403, 404)
    assert calls == []


@pytest.mark.parametrize(
    ("status", "detail"),
    [(409, "You already reported this question."), (429, "Too many reports today.")],
)
def test_librarys_refusal_reaches_the_member(client, member, monkeypatch, status, detail):
    member("admin")
    feedback_calls(monkeypatch, httpx.Response(status, json={"detail": detail}))
    monkeypatch.setattr(library, "get_question_context", in_set(SET_ID))
    method, url, body = FEEDBACK_ROUTES[2]

    response = client.request(method.upper(), url, json=body)

    assert (response.status_code, response.json()["detail"]) == (status, detail)
