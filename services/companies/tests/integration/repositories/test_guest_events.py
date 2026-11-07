"""Deleting a guest invite, however it goes, tells accounts to delete the guest's own sign-in and
library to unlink its rows (guests.deleted), in the same transaction; a signed-in candidate who
started keeps their account, so library only unlinks their rows on that interview's questions
(interview.candidates_deleted); one who never started said nothing, so isn't announced."""

import uuid

import pytest
from sqlalchemy import select, update
from testee_common.events.deletions import InterviewCandidatesDeleted

from companies.core.db import Session
from companies.models.invites import CandidateInvite
from companies.models.outbox import OutboxEvent
from companies.repositories import accounts, interview_generations, interviews, invites
from tests.integration import factories
from tests.integration.transactions import transaction


async def announced() -> set[str]:
    async with Session() as session:
        rows = await session.scalars(
            select(OutboxEvent.data).where(OutboxEvent.event_type == "guests.deleted")
        )

        return {user_id for data in rows for user_id in data["user_ids"]}


async def candidates_announced() -> list:
    async with Session() as session:
        rows = await session.scalars(
            select(OutboxEvent.data).where(OutboxEvent.event_type == "interview.candidates_deleted")
        )

        return [
            candidate
            for data in rows
            for candidate in InterviewCandidatesDeleted.model_validate(data).candidates
        ]


async def guest_and_member_invites():
    company = await factories.company(f"Acme {uuid.uuid4()}", "owner", "owner@example.com")
    interview = await transaction(interviews.create, company.id, uuid.uuid4(), "en", 60)
    interview.set_id = uuid.uuid4()
    await transaction(interview_generations.set_set_id, interview.id, interview.set_id)
    guest, _ = await transaction(
        invites.upsert,
        interview.id,
        f"g-{uuid.uuid4()}@example.com",
        "Backend",
        "Acme",
        "en",
        sign_in=False,
    )
    member, _ = await transaction(
        invites.upsert, interview.id, f"m-{uuid.uuid4()}@example.com", "Backend", "Acme", "en"
    )

    started, _ = await transaction(
        invites.upsert, interview.id, f"s-{uuid.uuid4()}@example.com", "Backend", "Acme", "en"
    )

    async with Session.begin() as session:
        await session.execute(
            update(CandidateInvite)
            .where(CandidateInvite.id == started.id)
            .values(user_id=f"user-{started.id}")
        )

    return company, interview, guest, member, started


async def remove_one(company, interview, *rows):
    for invite in rows:
        await transaction(invites.remove, invite, company.id)


async def by_retention(company, interview, *rows):
    await transaction(accounts.delete_invites, [invite.id for invite in rows])


async def with_the_interview(company, interview, *rows):
    await factories.interview_removed(interview.id)


async def with_the_company(company, interview, *rows):
    await factories.deleted(company.id)


@pytest.mark.parametrize("delete", [remove_one, by_retention, with_the_interview, with_the_company])
def test_a_deleted_invite_announces_its_guest_and_its_signed_in_candidate(run, delete):
    async def scenario():
        company, interview, guest, member, started = await guest_and_member_invites()
        await delete(company, interview, guest, member, started)

        return interview, guest, member, started, await announced(), await candidates_announced()

    interview, guest, member, started, user_ids, candidates = run(scenario())

    assert f"guest-{guest.id}" in user_ids
    assert f"guest-{member.id}" not in user_ids
    assert f"guest-{started.id}" not in user_ids
    # That interview's questions, for the candidate who started, and no one else from this test.
    mine = [row for row in candidates if row.set_id == interview.set_id]
    assert [row.user_id for row in mine] == [f"user-{started.id}"]
