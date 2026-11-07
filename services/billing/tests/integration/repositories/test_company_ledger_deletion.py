"""A deleted company's ledger goes a batch at a time, each batch its own transaction: every
hold and entry, then the wallet; another company's stays."""

import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import func, select, update
from testee_common.db import db

from billing.constants.credits import Reason
from billing.constants.products import OwnerType
from billing.constants.usage import SETTLED_HOLDS_KEEP_DAYS
from billing.core.db import Session
from billing.models.billing import Entry, Hold, Wallet
from billing.repositories import ledger
from billing.services import accounts, usage
from tests.integration.factories import welcomed
from tests.integration.transactions import transaction

COMPANY = OwnerType.COMPANY


async def ledger_rows(company_id: str) -> list[int]:
    """How many holds, entries and wallets the company has."""
    async with Session() as session:
        return [
            await session.scalar(
                select(func.count())
                .select_from(model)
                .where(model.owner_type == COMPANY, model.owner_id == company_id)
            )
            for model in (Hold, Entry, Wallet)
        ]


async def company_with_ledger() -> str:
    """A company with its welcome gift, five holds and three charges."""
    company_id = str(uuid.uuid4())
    await welcomed(company_id, f"{company_id}@example.com")

    for number in range(5):
        key = f"candidate:{company_id}:{number}"
        await transaction(ledger.reserve, COMPANY, company_id, 1, key, Reason.CANDIDATE)

        if number < 3:
            await transaction(ledger.charge, key)

    return company_id


def test_a_deleted_companys_ledger_goes_batch_after_batch(run, monkeypatch):
    monkeypatch.setattr(db, "DELETE_BATCH", 2)

    async def scenario():
        acme, other = await company_with_ledger(), await company_with_ledger()
        before = await ledger_rows(acme)
        await accounts.delete_company(acme)
        after, kept = await ledger_rows(acme), await ledger_rows(other)
        await accounts.delete_company(other)

        return before, after, kept

    before, after, kept = run(scenario())

    # More holds and entries than a batch, all gone; the other company's all there.
    assert before == [5, 4, 1]
    assert after == [0, 0, 0]
    assert kept == before


def test_settled_holds_go_past_their_time_while_open_ones_and_the_history_stay(run):
    now = datetime.now(UTC)

    async def scenario():
        company_id = await company_with_ledger()
        released = f"candidate:{company_id}:3"
        await transaction(ledger.release, released)

        async with Session.begin() as session:
            await session.execute(
                update(Hold)
                .where(Hold.owner_id == company_id, Hold.key != f"candidate:{company_id}:0")
                .values(created_at=now - timedelta(days=SETTLED_HOLDS_KEEP_DAYS + 1))
            )

        before = await ledger_rows(company_id)
        await usage.drop_old(now)

        return before, await ledger_rows(company_id)

    before, after = run(scenario())

    # Two charged and one released go; a recent charged one and the open one stay, with every
    # entry and the wallet.
    assert after == [before[0] - 3, before[1], before[2]]
