"""An interview sent again with its Idempotency-Key, against the real database and Redis: the
interview the first request made comes back, and only one is saved and generated."""

import uuid

import pytest
from fake_redis import FakeRedis
from sqlalchemy import func, select
from testee_common.auth.user import User
from testee_common.redis.redis_client import redis_client

from companies.config import settings
from companies.core.db import Session
from companies.integrations import billing
from companies.integrations import generation as generation_api
from companies.models.interviews import Interview
from companies.models.outbox import OutboxEvent
from companies.repositories import companies
from companies.services import idempotent_creates, interview_creation
from companies.services import members as member_service
from tests.integration import factories


@pytest.fixture
def generations(monkeypatch):
    """Billing and generation are elsewhere: a paying company, each generation started kept."""
    started = []

    async def paid(company_id):
        return True

    async def start(*args, **kwargs):
        started.append(str(uuid.uuid4()))

        return {"id": started[-1], "language": "en"}

    monkeypatch.setattr(billing, "company_paid", paid)
    monkeypatch.setattr(generation_api, "create", start)
    # The limits' counters aren't what's checked here.
    monkeypatch.setattr(interview_creation, "get_redis", FakeRedis)

    return started


def test_an_interview_sent_again_with_its_key_is_saved_and_generated_once(
    run, monkeypatch, generations
):
    async def scenario():
        redis = redis_client(settings.redis_url)
        monkeypatch.setattr(idempotent_creates, "get_redis", lambda: redis)
        company = await factories.company(f"Keyed {uuid.uuid4()}", "ann", "ann@example.com")

        try:
            first, again = [
                await interview_creation.create_once(
                    company, "ann", "en", "Backend developer", None, "start-1:interview"
                )
                for _ in range(2)
            ]
        finally:
            await redis.aclose()

        async with Session() as session:
            saved = await session.scalar(
                select(func.count())
                .select_from(Interview)
                .where(Interview.company_id == company.id)
            )

        return first, again, saved

    first, again, saved = run(scenario())

    assert first.id == again.id
    assert saved == 1
    assert len(generations) == 1


def test_a_member_invite_sent_again_with_its_key_is_saved_and_emailed_once(run, monkeypatch):
    async def paid(company_id):
        return True

    async def nothing():
        pass

    async def scenario():
        redis = redis_client(settings.redis_url)
        monkeypatch.setattr(idempotent_creates, "get_redis", lambda: redis)
        monkeypatch.setattr(member_service, "get_redis", FakeRedis)
        monkeypatch.setattr(billing, "company_paid", paid)
        monkeypatch.setattr(member_service.outbox_service, "flush_quietly", nothing)
        owner = User(uid="ann", email="ann@example.com", email_verified=True)
        created = await factories.company(f"Keyed {uuid.uuid4()}", "ann", "ann@example.com")
        email = f"{uuid.uuid4()}@example.com"

        async with Session() as session:
            company = await companies.get(session, created.id)

        try:
            first, again = [
                await member_service.invite_once(company, owner, email, "admin", "action-1")
                for _ in range(2)
            ]
        finally:
            await redis.aclose()

        async with Session() as session:
            emails = await session.scalars(
                select(OutboxEvent).where(OutboxEvent.data["email"].astext == email)
            )

            return first, again, len(emails.all())

    first, again, emails = run(scenario())

    assert first.id == again.id
    assert again.invited_email == first.invited_email
    assert emails == 1
