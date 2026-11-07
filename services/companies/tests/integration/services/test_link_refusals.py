"""A job-ad link's refusal told to the company, against the real database and Redis: one notice
an hour per interview however many are refused, and a save that fails frees the hour."""

import uuid
from types import SimpleNamespace

import pytest
from sqlalchemy import select

from companies.constants.invites import LINK_REFUSED_KEY
from companies.core.db import Session
from companies.integrations import redis as redis_integration
from companies.models.outbox import OutboxEvent
from companies.repositories import outbox
from companies.services import link_refusals
from companies.services import outbox as outbox_service


@pytest.fixture
def interview(monkeypatch):
    """An interview of its own; events stay in the outbox, to be read, and Redis's client is made
    on this test's event loop."""

    async def no_flush():
        pass

    monkeypatch.setattr(outbox_service, "flush_quietly", no_flush)
    redis_integration.get_redis.cache_clear()

    return SimpleNamespace(id=uuid.uuid4(), company_id=uuid.uuid4(), title="Backend")


async def notices(interview) -> list[dict]:
    async with Session() as session:
        rows = await session.scalars(select(OutboxEvent))

    return [
        row.data
        for row in rows
        if row.data.get("recipient_id") == str(interview.company_id)
        and row.data.get("kind") == "link_refused"
    ]


def test_a_burst_of_refusals_tells_the_company_once(run, interview):
    async def scenario():

        for _ in range(3):
            await link_refusals.tell_company(interview)

        return await notices(interview)

    found = run(scenario())

    assert len(found) == 1
    assert found[0]["link"] == f"/companies/{interview.company_id}/interviews/{interview.id}"


def test_each_interview_has_its_own_hour(run, interview):
    other = SimpleNamespace(id=uuid.uuid4(), company_id=interview.company_id, title=None)

    async def scenario():
        await link_refusals.tell_company(interview)
        await link_refusals.tell_company(other)

        return await notices(interview)

    assert len(run(scenario())) == 2


def test_a_save_that_fails_frees_the_hour_for_the_next_refusal(run, interview, monkeypatch):
    real = outbox.notify

    def broken(_session, _event):
        raise RuntimeError("the database went away")

    async def scenario():
        monkeypatch.setattr(outbox, "notify", broken)
        # The candidate's 429 doesn't depend on it: nothing is raised.
        await link_refusals.tell_company(interview)
        key = LINK_REFUSED_KEY.format(interview_id=interview.id)
        freed = await redis_integration.get_redis().get(key)
        monkeypatch.setattr(outbox, "notify", real)
        await link_refusals.tell_company(interview)

        return freed, await notices(interview)

    freed, found = run(scenario())

    assert freed is None
    assert len(found) == 1
