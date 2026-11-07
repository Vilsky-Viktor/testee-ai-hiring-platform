"""An account's deletion run again after a restore: what was under the email then goes again,
and what's been made under the same address since, someone's new, stays."""

import uuid
from datetime import UTC, datetime

from companies.core.db import Session
from companies.integrations import rounds
from companies.models.companies import Member
from companies.repositories import interviews, invites
from companies.services import accounts, candidate_billing
from tests.integration import factories
from tests.integration.transactions import transaction


async def nothing(*args):
    pass


def test_a_replay_erases_the_old_invite_and_leaves_the_new_one_to_that_address(run, monkeypatch):
    monkeypatch.setattr(rounds, "delete_invite_sessions", nothing)
    monkeypatch.setattr(candidate_billing, "settle_removed", nothing)

    async def scenario():
        company = await factories.company(f"Acme {uuid.uuid4()}", "owner", "owner@example.com")
        old = await transaction(interviews.create, company.id, uuid.uuid4(), "en", 60)
        new = await transaction(interviews.create, company.id, uuid.uuid4(), "en", 60)
        email = f"{uuid.uuid4()}@example.com"
        sender = {"company": "Acme", "company_id": str(company.id), "inviter": "Owner"}
        await transaction(invites.upsert, old.id, email, "B", "A", "en")
        erased_at = datetime.now(UTC)
        fresh, _ = await transaction(invites.upsert, new.id, email, "B", "A", "en")
        joined = await factories.member(company.id, email, "admin", sender)
        await accounts.delete_user(f"gone-{uuid.uuid4()}", email, erased_at)

        async with Session() as session:
            return (
                await invites.find(session, old.id, email),
                await invites.find(session, new.id, email),
                fresh.id,
                await session.get(Member, joined.id),
            )

    gone, kept, fresh, member = run(scenario())

    assert gone is None
    assert kept.id == fresh
    assert member is not None
