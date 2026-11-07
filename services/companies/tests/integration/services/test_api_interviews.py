"""An interview made through the public API, against the real database: what generation is told
to do with its proposed topics, and a suspended company's refusal."""

import uuid

import pytest
from fake_redis import FakeRedis
from sqlalchemy import func, select
from testee_common.auth.key_actor import key_actor
from testee_common.i18n.i18n import CodedError

from companies.constants import error_codes
from companies.constants.invites import COMPANY_SUSPENDED
from companies.core.db import Session
from companies.integrations import billing
from companies.integrations import generation as generation_api
from companies.models.interviews import Interview
from companies.repositories import superadmin_companies
from companies.services import interview_creation
from tests.integration import factories
from tests.integration.transactions import transaction


@pytest.fixture
def start(monkeypatch):
    """Billing and generation are elsewhere: `start(paid)` says whether the company ever topped
    up, and gives what each generation started was told."""
    told = []

    async def create(*args, auto_approve):
        told.append(auto_approve)

        return {"id": str(uuid.uuid4()), "language": "en"}

    def company_that(paid):
        async def company_paid(company_id):
            return paid

        monkeypatch.setattr(billing, "company_paid", company_paid)

        return told

    monkeypatch.setattr(generation_api, "create", create)
    monkeypatch.setattr(interview_creation, "get_redis", FakeRedis)

    return company_that


async def saved_interviews(company_id) -> int:
    async with Session() as session:
        return await session.scalar(
            select(func.count()).select_from(Interview).where(Interview.company_id == company_id)
        )


@pytest.mark.parametrize(("paid", "goes_on"), [(True, True), (False, False)])
def test_through_the_api_only_a_paying_companys_topics_go_on_unreviewed(run, start, paid, goes_on):
    told = start(paid)

    async def scenario():
        company = await factories.company(f"Api {uuid.uuid4()}", "ann", "ann@example.com")
        await interview_creation.create_for_api(
            company.id, key_actor(uuid.uuid4()), "Backend developer", None
        )

        return await saved_interviews(company.id)

    assert run(scenario()) == 1
    assert told == [goes_on]


def test_on_the_site_a_paying_companys_topics_wait_for_their_review(run, start):
    told = start(True)

    async def scenario():
        company = await factories.company(f"Site {uuid.uuid4()}", "ann", "ann@example.com")
        await interview_creation.create(company, "ann", "en", "Backend developer", None, "mcp")
        await interview_creation.create(company, "ann", "en", "Backend developer", None)

    run(scenario())

    assert told == [False, False]


def test_a_suspended_company_starts_no_generation_and_saves_no_interview(run, start):
    told = start(True)

    async def scenario():
        company = await factories.company(f"Held {uuid.uuid4()}", "ann", "ann@example.com")
        await transaction(superadmin_companies.set_suspended, company.id, True)

        with pytest.raises(CodedError) as refused:
            await interview_creation.create_for_api(
                company.id, key_actor(uuid.uuid4()), "Backend", None
            )

        return refused.value, await saved_interviews(company.id)

    refused, saved = run(scenario())

    assert (refused.status_code, refused.detail, refused.code) == (
        409,
        COMPANY_SUSPENDED,
        error_codes.COMPANY_SUSPENDED,
    )
    assert saved == 0
    assert told == []
