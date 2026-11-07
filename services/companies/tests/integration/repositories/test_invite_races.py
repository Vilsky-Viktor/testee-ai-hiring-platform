"""A candidate's invite started twice at once (two tabs, a double click), or started while the
company sends it again, proven to overlap: the first call's transaction stays open at its commit
until the second is seen waiting on the invite's row lock (testee_common.db.lock_waits)."""

import asyncio
import os
import uuid
from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from testee_common.db.lock_waits import hold_first_commit, race, wait_for_lock_wait

from companies.constants.events import CANDIDATE_INVITED, CANDIDATE_STARTED
from companies.constants.invites import InviteStatus
from companies.core.db import Session
from companies.core.exceptions import AlreadyFinished
from companies.models.invites import CandidateInvite
from companies.models.outbox import OutboxEvent
from companies.repositories import interviews, invite_expiry, invite_progress, invites
from tests.integration import factories, transactions
from tests.integration.transactions import transaction


def test_two_starts_at_once_start_the_invite_once(run, monkeypatch):
    async def scenario():
        company = await factories.company(f"Acme {uuid.uuid4()}", "owner", "owner@example.com")
        interview = await transaction(interviews.create, company.id, uuid.uuid4(), "en", 60)
        invite, _ = await transaction(invites.upsert, interview.id, "s@example.com", "B", "A", "en")
        held = hold_first_commit(monkeypatch, transactions)
        before = await race(
            os.environ["DATABASE_URL"],
            held,
            transaction(invite_progress.start, invite.id, "uid-1"),
            transaction(invite_progress.start, invite.id, "uid-1"),
        )

        async with Session() as session:
            started = await session.scalars(
                select(OutboxEvent).where(
                    OutboxEvent.event_type == CANDIDATE_STARTED,
                    OutboxEvent.data["candidate_invite_id"].astext == str(invite.id),
                )
            )

            return before, len(started.all())

    before, started = run(scenario())

    assert before == (InviteStatus.INVITED, InviteStatus.IN_PROCESS)
    assert started == 1


def test_sending_an_expired_invite_again_while_its_candidate_starts_keeps_the_start(
    run, monkeypatch
):
    async def scenario():
        company = await factories.company(f"Acme {uuid.uuid4()}", "owner", "owner@example.com")
        interview = await transaction(interviews.create, company.id, uuid.uuid4(), "en", 60)
        invite, _ = await transaction(
            invites.upsert, interview.id, "s@example.com", "B", "A", "en", name="Ann"
        )
        await transaction(
            invite_expiry.mark_expired, invite.id, datetime.now(UTC) + timedelta(seconds=1)
        )
        held = hold_first_commit(monkeypatch, transactions)
        _, (_, revived) = await race(
            os.environ["DATABASE_URL"],
            held,
            transaction(invite_progress.start, invite.id, "uid-1"),
            transaction(invites.upsert, interview.id, "s@example.com", "B", "A", "en", name="Ann"),
        )

        return revived, (await transaction(invites.get, invite.id)).status

    assert run(scenario()) == (False, InviteStatus.IN_PROCESS)


def test_a_candidate_starting_just_after_a_send_read_the_invite_keeps_the_start(run, monkeypatch):
    """The start comes between the send's read and its write. The read holds the row, so the start
    waits and has the last word; without the lock the send writes "invited" over the start."""
    started = []
    read = AsyncSession.scalar

    async def scenario():
        company = await factories.company(f"Acme {uuid.uuid4()}", "owner", "owner@example.com")
        interview = await transaction(interviews.create, company.id, uuid.uuid4(), "en", 60)
        invite, _ = await transaction(
            invites.upsert, interview.id, "s@example.com", "B", "A", "en", name="Ann"
        )
        await transaction(invite_progress.mark_undelivered, invite.id, {"kind": "undelivered"})

        async def start_after_the_read(session, statement, *args, **kwargs):
            found = await read(session, statement, *args, **kwargs)

            if isinstance(found, CandidateInvite) and not started:
                started.append(
                    asyncio.create_task(transaction(invite_progress.start, invite.id, "uid-1"))
                )
                waiting = asyncio.create_task(wait_for_lock_wait(os.environ["DATABASE_URL"]))
                await asyncio.wait({started[0], waiting}, return_when=asyncio.FIRST_COMPLETED)
                waiting.cancel()

            return found

        monkeypatch.setattr(AsyncSession, "scalar", start_after_the_read)
        await transaction(invites.upsert, interview.id, "s@example.com", "B", "A", "en", name="Ann")
        await started[0]
        monkeypatch.setattr(AsyncSession, "scalar", read)

        return (await transaction(invites.get, invite.id)).status

    assert run(scenario()) == InviteStatus.IN_PROCESS


def test_an_invite_sent_again_after_its_candidate_started_keeps_their_dates(run):
    async def scenario():
        company = await factories.company(f"Acme {uuid.uuid4()}", "owner", "owner@example.com")
        interview = await transaction(interviews.create, company.id, uuid.uuid4(), "en", 60)
        invite, _ = await transaction(invites.upsert, interview.id, "s@example.com", "B", "A", "en")
        await transaction(invite_progress.start, invite.id, "uid-1")
        again, _ = await transaction(invites.upsert, interview.id, "s@example.com", "B", "A", "en")

        return invite.sent_at, again.sent_at, again.status

    first, again, status = run(scenario())

    assert first == again
    assert status == InviteStatus.IN_PROCESS


def test_no_invite_is_sent_to_a_candidate_who_finished_meanwhile(run):
    async def scenario():
        company = await factories.company(f"Acme {uuid.uuid4()}", "owner", "owner@example.com")
        interview = await transaction(interviews.create, company.id, uuid.uuid4(), "en", 60)
        invite, _ = await transaction(invites.upsert, interview.id, "s@example.com", "B", "A", "en")
        await transaction(invite_progress.start, invite.id, "uid-1")
        await transaction(invite_progress.finish, invite.id, 70, False, {}, str(uuid.uuid4()))

        with pytest.raises(AlreadyFinished):
            await transaction(invites.upsert, interview.id, "s@example.com", "B", "A", "en")

        async with Session() as session:
            sent = await session.scalars(
                select(OutboxEvent).where(
                    OutboxEvent.event_type == CANDIDATE_INVITED,
                    OutboxEvent.data["invite_id"].astext == str(invite.id),
                )
            )

            return len(sent.all())

    assert run(scenario()) == 1
