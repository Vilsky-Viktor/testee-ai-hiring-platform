import uuid
from datetime import UTC, datetime, timedelta

from companies.core.db import Session
from companies.models.removals import RemovedInvite
from companies.repositories import removals
from tests.integration.transactions import transaction


async def removed_at(company_id, when):
    row = RemovedInvite(invite_id=uuid.uuid4(), company_id=company_id, removed_at=when)

    async with Session.begin() as session:
        session.add(row)

    return row


def test_a_companys_removals_page_oldest_first_without_repeating_or_skipping_one(run):
    async def scenario():
        company, other = uuid.uuid4(), uuid.uuid4()
        now = datetime.now(UTC)
        made = [await removed_at(company, now - timedelta(hours=hours)) for hours in (3, 2, 1)]
        await removed_at(other, now)
        first = await transaction(removals.of_company, company, 0, 2)
        rest = await transaction(
            removals.of_company, company, 0, 2, first[-1].removed_at, first[-1].invite_id
        )

        return made, first + rest

    made, listed = run(scenario())

    assert [row.invite_id for row in listed] == [row.invite_id for row in made]
