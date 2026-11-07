import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select, update
from testee_common.config.constants import DELETED_USER

from ats.constants.ats import AtsProvider, ConnectionStatus
from ats.constants.events import ATS_CANDIDATE_ARRIVED
from ats.core.db import Session
from ats.handlers.dispatch import handle
from ats.integrations import companies
from ats.models.ats import AtsCandidate, AtsJobLink
from ats.models.outbox import OutboxEvent
from ats.repositories import ats, ats_candidates, ats_erased, ats_links
from ats.services import accounts
from ats.services import ats_candidates as candidate_service
from tests.integration.transactions import transaction

JOB = {"id": "A1", "name": "Accountant"}
STAGE = {"id": "assessment", "name": "Assessment"}


async def linked(company_id, interview_id, job=JOB, maker="ann"):
    """A Workable connection with one job linked to the interview and one candidate sent."""
    await transaction(ats.connect, company_id, AtsProvider.WORKABLE, "acme", "sealed", maker)
    connection = await transaction(ats.connection, company_id, AtsProvider.WORKABLE)
    link_id = await transaction(
        ats_links.add_link, connection.company_id, connection.id, interview_id, job, STAGE, "ann"
    )
    row = await transaction(
        ats_candidates.add, connection.id, link_id, interview_id, "c-1", "Ann@x.com"
    )

    return connection, link_id, row


async def rows_of(model, column, value) -> list:
    async with Session() as session:
        return list((await session.scalars(select(model).where(column == value))).all())


def test_a_deleted_interviews_candidates_go_in_batches(run, monkeypatch):
    monkeypatch.setattr("testee_common.db.db.DELETE_BATCH", 1)

    async def scenario():
        company, deleted = uuid.uuid4(), uuid.uuid4()
        connection, link_id, _ = await linked(company, deleted)

        for index in range(2, 4):
            await transaction(
                ats_candidates.add, connection.id, link_id, deleted, f"c-{index}", f"c{index}@x.com"
            )

        await accounts.remove_interview(deleted)
        left = await rows_of(AtsCandidate, AtsCandidate.connection_id, connection.id)
        await transaction(ats.delete_company, company)

        return left

    assert run(scenario()) == []


def test_a_deleted_interview_takes_its_links_and_candidates_even_when_delivered_twice(run):
    async def scenario():
        company, deleted, kept = uuid.uuid4(), uuid.uuid4(), uuid.uuid4()
        connection, _, _ = await linked(company, deleted)
        await transaction(
            ats_links.add_link,
            connection.company_id,
            connection.id,
            kept,
            {"id": "B2", "name": "Clerk"},
            STAGE,
            "ann",
        )
        event = {"interview_id": str(deleted), "company_id": str(company)}
        await handle("interview.deleted", event)
        await handle("interview.deleted", event)
        found = (
            await rows_of(AtsJobLink, AtsJobLink.connection_id, connection.id),
            await rows_of(AtsCandidate, AtsCandidate.connection_id, connection.id),
            await transaction(ats.connections, company),
        )
        await transaction(ats.delete_company, company)

        return kept, found

    kept, (links, candidates, connections) = run(scenario())

    assert [link.interview_id for link in links] == [kept]
    assert candidates == []
    assert len(connections) == 1


def test_a_deleted_company_takes_its_connections_links_and_candidates(run):
    async def scenario():
        company, other = uuid.uuid4(), uuid.uuid4()
        connection, _, _ = await linked(company, uuid.uuid4())
        theirs, _, _ = await linked(other, uuid.uuid4())
        await handle("company.deleted", {"company_id": str(company)})
        await handle("company.deleted", {"company_id": str(company)})
        found = (
            await transaction(ats.connections, company),
            await rows_of(AtsJobLink, AtsJobLink.connection_id, connection.id),
            await rows_of(AtsCandidate, AtsCandidate.connection_id, connection.id),
            len(await rows_of(AtsCandidate, AtsCandidate.connection_id, theirs.id)),
        )
        await transaction(ats.delete_company, other)

        return found

    assert run(scenario()) == ([], [], [], 1)


def test_an_accounts_candidates_are_exported_and_deleted_by_email(run):
    async def scenario():
        company = uuid.uuid4()
        await linked(company, uuid.uuid4())
        exported = await transaction(ats_candidates.of_email, "ANN@x.com")
        await transaction(ats_candidates.delete_email, "ann@X.com")
        left = await transaction(ats_candidates.of_email, "ann@x.com")
        await transaction(ats.delete_company, company)

        return exported, left

    exported, left = run(scenario())

    assert [row.email for row in exported] == ["ann@x.com"]
    assert left == []


def test_candidates_past_their_retention_period_go(run):
    async def scenario():
        company = uuid.uuid4()
        _, _, old = await linked(company, uuid.uuid4())
        _, _, new = await linked(company, uuid.uuid4(), {"id": "B2", "name": "Clerk"})

        async with Session() as session:
            await session.execute(
                update(AtsCandidate)
                .where(AtsCandidate.id == old.id)
                .values(created_at=datetime.now(UTC) - timedelta(days=400))
            )
            await session.commit()

        deleted = await ats_candidates.delete_older_than(
            Session, datetime.now(UTC) - timedelta(days=365)
        )
        left = await rows_of(AtsCandidate, AtsCandidate.interview_id, new.interview_id)
        await transaction(ats.delete_company, company)

        return deleted, left

    deleted, left = run(scenario())

    assert deleted == 1
    assert len(left) == 1


def test_a_candidate_the_company_erased_goes_from_the_ats_record_too(run):
    async def scenario():
        company, interview_id = uuid.uuid4(), uuid.uuid4()
        connection, link_id, _ = await linked(company, interview_id)
        await transaction(
            ats_candidates.add, connection.id, link_id, interview_id, "c-2", "bo@x.com"
        )
        event = {
            "company_id": str(company),
            "interview_id": str(interview_id),
            "email": "ann@x.com",
        }
        # Redelivered: deleting twice deletes nothing more.
        await handle("candidate.removed", event)
        await handle("candidate.removed", event)
        left = await rows_of(AtsCandidate, AtsCandidate.connection_id, connection.id)
        await transaction(ats.delete_company, company)

        return [row.email for row in left]

    assert run(scenario()) == ["bo@x.com"]


def test_a_deleted_makers_connection_stays_without_their_id_and_stops_inviting(run, monkeypatch):
    invited = []

    async def invite(interview_id, email, sender_id):
        invited.append(sender_id)

        return uuid.uuid4()

    monkeypatch.setattr(companies, "invite", invite)
    maker = f"gone-{uuid.uuid4()}"

    async def scenario():
        company, interview_id = uuid.uuid4(), uuid.uuid4()
        _, _, row = await linked(company, interview_id, maker=maker)
        exported = await transaction(ats.made_by, maker)
        await transaction(ats.forget_maker, maker)
        # Safe to repeat.
        await transaction(ats.forget_maker, maker)
        connection = await transaction(ats.connection, company, AtsProvider.WORKABLE)
        interview = {"company_id": str(company), "title": "Accountant", "ready": True}
        await candidate_service.invite(row, connection, interview)
        left = await transaction(ats.made_by, maker)
        await transaction(ats.delete_company, company)

        return exported, connection, left

    exported, connection, left = run(scenario())

    assert [row.account for row in exported] == ["acme"]
    assert (connection.created_by, connection.status) == (DELETED_USER, ConnectionStatus.BROKEN)
    assert left == []
    assert invited == []


def test_an_erased_candidates_web_hook_coming_again_saves_and_invites_nobody(run):
    """Erased by the company, then the ATS's retry of the same web hook: the unique key that
    stopped it died with the row, so nothing but the erasure's note can."""
    company_id, interview_id = uuid.uuid4(), uuid.uuid4()

    async def events():
        async with Session() as session:
            return await session.scalar(
                select(func.count())
                .select_from(OutboxEvent)
                .where(OutboxEvent.event_type == ATS_CANDIDATE_ARRIVED)
            )

    async def scenario():
        connection, link_id, _ = await linked(company_id, interview_id)
        await accounts.remove_candidate(interview_id, "ann@x.com")
        before = await events()
        again = await transaction(
            ats_candidates.add, connection.id, link_id, interview_id, "c-1", "Ann@x.com"
        )
        left = await rows_of(AtsCandidate, AtsCandidate.interview_id, interview_id)
        another = await transaction(
            ats_candidates.add, connection.id, link_id, interview_id, "c-2", "bo@x.com"
        )

        return again, left, await events() - before, another

    again, left, new_events, another = run(scenario())

    assert (again, left) == (None, [])
    # Someone else on the same job still arrives.
    assert new_events == 1
    assert another.candidate_id == "c-2"


def test_a_deleted_accounts_web_hook_coming_again_saves_nobody_and_the_note_ends(run):
    company_id, interview_id = uuid.uuid4(), uuid.uuid4()

    async def scenario():
        connection, link_id, _ = await linked(company_id, interview_id)
        await accounts.remove_user("someone", "ann@x.com")
        again = await transaction(
            ats_candidates.add, connection.id, link_id, interview_id, "c-1", "ann@x.com"
        )
        await ats_erased.delete_older_than(Session, datetime.now(UTC) + timedelta(days=1))
        after_the_note = await transaction(
            ats_candidates.add, connection.id, link_id, interview_id, "c-1", "ann@x.com"
        )

        return again, after_the_note

    again, after_the_note = run(scenario())

    assert again is None
    assert after_the_note.candidate_id == "c-1"
