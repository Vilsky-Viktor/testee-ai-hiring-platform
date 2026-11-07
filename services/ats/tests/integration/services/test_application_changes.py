"""A Teamtailor application a web hook said changed is kept until it's read: through a failing
Teamtailor, a refused key and a change arriving during the read."""

import uuid
from datetime import UTC, datetime, timedelta

import pytest
from fastapi import HTTPException
from sqlalchemy import select

from ats.constants.ats import AtsProvider
from ats.core.db import Session
from ats.helpers.notifications import connection_broken
from ats.models.ats import AtsApplicationChange, AtsCandidate
from ats.repositories import ats, ats_applications, ats_links
from ats.services import ats as integrations
from ats.services import ats_applications as applications
from ats.services import outbox as outbox_service
from tests.integration.transactions import transaction

JOB = {"id": "101", "name": "Accountant"}
STAGE = {"id": "7", "name": "Assessment"}
APPLICATION = {
    "job_id": "101",
    "stage_id": "7",
    "candidate_id": "44",
    "email": "ann@example.com",
    "name": "Ann",
}


@pytest.fixture(autouse=True)
def unsent(monkeypatch):
    """The outbox isn't sent: the tests read what's saved."""

    async def nothing():
        pass

    monkeypatch.setattr(outbox_service, "flush_quietly", nothing)


def teamtailor_answers(monkeypatch, answer):
    """Teamtailor's reads: `answer` is the application, or the exception it fails with."""

    async def call(connection, action, **arguments):
        if isinstance(answer, Exception):
            raise answer

        return answer

    monkeypatch.setattr(integrations, "call", call)


async def linked():
    company = uuid.uuid4()
    await transaction(ats.connect, company, AtsProvider.TEAMTAILOR, "acme", "sealed", "ann")
    connection = await transaction(ats.connection, company, AtsProvider.TEAMTAILOR)
    await transaction(ats_links.add_link, company, connection.id, uuid.uuid4(), JOB, STAGE, "ann")

    return connection


async def changes_of(connection) -> list[AtsApplicationChange]:
    async with Session() as session:
        query = select(AtsApplicationChange).where(
            AtsApplicationChange.connection_id == connection.id
        )

        return list((await session.scalars(query)).all())


async def candidates_of(connection) -> list[str]:
    async with Session() as session:
        query = select(AtsCandidate.candidate_id).where(AtsCandidate.connection_id == connection.id)

        return list((await session.scalars(query)).all())


def test_a_failed_read_keeps_the_change_for_the_recovery_job(run, monkeypatch):
    async def scenario():
        connection = await linked()
        await applications.changed(connection, "55")
        [row] = await changes_of(connection)
        teamtailor_answers(monkeypatch, HTTPException(502, "Teamtailor didn't answer"))

        with pytest.raises(HTTPException):
            await applications.read_changed({"ats_application_change_id": str(row.id)})

        kept = len(await changes_of(connection))
        teamtailor_answers(monkeypatch, APPLICATION)
        # Out of time: nothing new is read.
        await applications.recover(0)
        kept += len(await changes_of(connection))
        await applications.recover(float("inf"))
        left = await changes_of(connection)
        arrived = await candidates_of(connection)
        await transaction(ats.delete_company, connection.company_id)

        return kept, left, arrived

    kept, left, arrived = run(scenario())

    assert kept == 2
    assert left == []
    assert arrived == ["44"]


def test_a_change_waits_for_reconnecting_then_is_read(run, monkeypatch):
    async def scenario():
        connection = await linked()
        await applications.changed(connection, "55")
        notice = connection_broken(connection.company_id, connection.provider)
        await transaction(ats.mark_broken, connection.id, notice)
        teamtailor_answers(monkeypatch, APPLICATION)
        await applications.recover(float("inf"))
        waiting = len(await changes_of(connection))
        await transaction(
            ats.connect, connection.company_id, AtsProvider.TEAMTAILOR, "acme", "sealed", "ann"
        )
        await applications.recover(float("inf"))
        arrived = await candidates_of(connection)
        await transaction(ats.delete_company, connection.company_id)

        return waiting, arrived

    assert run(scenario()) == (1, ["44"])


def test_an_application_changing_during_its_read_is_read_again(run, monkeypatch):
    async def scenario():
        connection = await linked()
        await applications.changed(connection, "55")
        [row] = await changes_of(connection)

        async def call(connection, action, **arguments):
            await applications.changed(connection, "55")

            return {**APPLICATION, "stage_id": "other"}

        monkeypatch.setattr(integrations, "call", call)
        await applications.read(row, connection)
        kept = len(await changes_of(connection))
        teamtailor_answers(monkeypatch, APPLICATION)
        await applications.recover(float("inf"))
        arrived = await candidates_of(connection)
        await transaction(ats.delete_company, connection.company_id)

        return kept, arrived

    assert run(scenario()) == (1, ["44"])


def test_changes_never_read_go_after_their_time_and_with_their_connection(run):
    async def scenario():
        connection = await linked()
        await applications.changed(connection, "55")
        deleted = await ats_applications.delete_older_than(Session, datetime.now(UTC))
        await applications.changed(connection, "56")
        kept = await ats_applications.delete_older_than(
            Session, datetime.now(UTC) - timedelta(days=1)
        )
        await transaction(ats.delete_company, connection.company_id)

        return deleted, kept, await changes_of(connection)

    assert run(scenario()) == (1, 0, [])
