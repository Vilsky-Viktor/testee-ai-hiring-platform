"""A new company and interview with an Idempotency-Key (the site's start, sent again after a
reload): the same request again gets what the first made, made once; one while the first runs
is refused; the key with another request too; without a key, each request makes one."""

import uuid
from datetime import UTC, datetime
from types import SimpleNamespace

import pytest
from fake_redis import FakeRedis
from testee_common.auth.auth import current_user
from testee_common.auth.user import User
from testee_common.redis.idempotency import PENDING

from companies.api.v1 import interviews as interview_routes
from companies.main import app
from companies.models.companies import Company
from companies.repositories import companies, interviews
from companies.schemas.interviews import InterviewOut
from companies.services import company_creation, idempotent_creates, interview_creation

COMPANY_ID = uuid.uuid4()


def sign_in(uid="bob"):
    app.dependency_overrides[current_user] = lambda: User(
        uid=uid, email=f"{uid}@example.com", email_verified=True, name="Bob"
    )


@pytest.fixture
def redis(monkeypatch):
    redis = FakeRedis()
    monkeypatch.setattr(idempotent_creates, "get_redis", lambda: redis)
    monkeypatch.setattr(interview_routes, "get_redis", lambda: redis)
    sign_in()

    return redis


@pytest.fixture
def made_companies(monkeypatch, redis):
    """Each company the service really makes, by id, also found again by it."""
    made = {}

    async def create(name, user, request, via, country):
        company = Company(id=uuid.uuid4(), name=name, created_at=datetime.now(UTC))
        made[company.id] = company

        return company

    async def get(session, company_id):
        return made.get(company_id)

    monkeypatch.setattr(company_creation, "create", create)
    monkeypatch.setattr(companies, "get", get)

    return made


@pytest.fixture
def made_interviews(monkeypatch, redis):
    """Each interview the service really makes, by id, also found again by it."""
    made = {}

    async def editor(user, company_id):
        return SimpleNamespace(id=company_id), "owner"

    async def create(company, user_id, language, text, generate_in, via=None):
        interview = SimpleNamespace(id=uuid.uuid4(), company_id=company.id)
        made[interview.id] = interview

        return await out(interview)

    async def get(session, interview_id):
        return made.get(interview_id)

    async def out(interview):
        return InterviewOut(
            id=str(interview.id),
            generation_id=str(uuid.uuid4()),
            set_id=None,
            generation_failed=False,
            title=None,
            question_seconds=60,
            candidate_count=0,
            hired=False,
            pass_mark=70,
            link_token=None,
            status="new",
            created_at="2026-11-05T09:00:00Z",
        )

    monkeypatch.setattr(interview_routes, "require_editor", editor)
    monkeypatch.setattr(interview_creation, "create", create)
    monkeypatch.setattr(interviews, "get", get)
    monkeypatch.setattr(interview_creation, "interview_out", out)

    return made


def new_company(client, name="Acme", key=None):
    headers = {"Idempotency-Key": key} if key else {}

    return client.post("/companies", json={"name": name}, headers=headers)


def new_interview(client, text="Backend developer", key=None):
    headers = {"Idempotency-Key": key} if key else {}

    return client.post(
        f"/interviews?company_id={COMPANY_ID}",
        json={"text": text, "generate_in": "en"},
        headers=headers,
    )


def test_a_company_sent_again_with_its_key_is_the_first_one_made_once(client, made_companies):
    first = new_company(client, key="start-1:company")
    again = new_company(client, key="start-1:company")

    assert (first.status_code, again.status_code) == (201, 201)
    assert first.json()["id"] == again.json()["id"]
    assert again.json()["name"] == "Acme"
    assert len(made_companies) == 1


def test_a_company_key_sent_with_another_name_is_refused(client, made_companies):
    new_company(client, "Acme", key="start-1:company")
    reused = new_company(client, "Globex", key="start-1:company")

    assert (reused.status_code, reused.json()["code"]) == (422, "idempotency_key_reused")
    assert len(made_companies) == 1


def test_companies_without_a_key_are_each_made(client, made_companies):
    first, second = new_company(client), new_company(client)

    assert first.json()["id"] != second.json()["id"]
    assert len(made_companies) == 2


def test_another_users_same_key_makes_their_own_company(client, made_companies):
    first = new_company(client, key="shared")
    sign_in("eve")
    theirs = new_company(client, key="shared")

    assert first.json()["id"] != theirs.json()["id"]
    assert len(made_companies) == 2


def test_an_interview_sent_again_with_its_key_is_the_first_one_made_once(client, made_interviews):
    first = new_interview(client, key="start-1:interview")
    again = new_interview(client, key="start-1:interview")

    assert (first.status_code, again.status_code) == (201, 201)
    assert first.json()["id"] == again.json()["id"]
    assert len(made_interviews) == 1


def test_an_interview_sent_again_while_the_first_runs_is_refused(client, redis, made_interviews):
    new_interview(client, key="start-1:interview")
    # The first is still running: its claim is pending.
    (name,) = redis.counts
    request = str(redis.counts[name]).rpartition(":")[0]
    redis.counts[name] = f"{request}:{PENDING}"

    running = new_interview(client, key="start-1:interview")

    assert (running.status_code, running.json()["code"]) == (409, "request_in_progress")
    assert len(made_interviews) == 1


def test_an_interview_key_sent_with_another_description_is_refused(client, made_interviews):
    new_interview(client, "Backend developer", key="start-1:interview")
    reused = new_interview(client, "Data analyst", key="start-1:interview")

    assert (reused.status_code, reused.json()["code"]) == (422, "idempotency_key_reused")
    assert len(made_interviews) == 1


def test_interviews_without_a_key_are_each_made(client, made_interviews):
    new_interview(client)
    new_interview(client)

    assert len(made_interviews) == 2
