"""What the refund tests share: a company's paid top-ups, dated as a test needs, its credits
spent or set aside, the refund offers it sees, and Paddle faked at the module's edge."""

import uuid
from datetime import UTC, datetime, timedelta

import httpx
from sqlalchemy import select, update
from testee_common.events.notifications import NOTIFICATION_REQUESTED

from billing.constants.credits import Reason
from billing.constants.products import OwnerType
from billing.core.db import Session
from billing.integrations import paddle
from billing.models.billing import Entry, Hold, Refund
from billing.models.outbox import OutboxEvent
from billing.repositories import ledger
from billing.services import holds, refund_offers, topups

COMPANY = OwnerType.COMPANY


def company() -> str:
    return str(uuid.uuid4())


def transaction_id() -> str:
    return f"txn_{uuid.uuid4().hex[:26]}"


async def bought(company_id: str, credits=5_000, paid=5_000, days_ago=0.0) -> str:
    """A paid top-up of the company, bought that long ago; its Paddle id."""
    txn = transaction_id()
    at = datetime.now(UTC) - timedelta(days=days_ago)
    await topups.grant(
        COMPANY, company_id, credits, 1, txn, "topup_50", "ann", str(paid), "USD", at
    )

    async with Session.begin() as session:
        await session.execute(
            update(Entry).where(Entry.key == f"{txn}:topup_50").values(created_at=at)
        )

    return txn


async def spent(company_id: str, credits: int) -> None:
    """Credits used up by a candidate who answered."""
    key = f"candidate:{uuid.uuid4()}"

    async with Session.begin() as session:
        assert await ledger.reserve(session, COMPANY, company_id, credits, key, Reason.CANDIDATE)
        await ledger.charge(session, key)


async def set_aside(company_id: str) -> str:
    """A candidate's credits set aside; the key of their hold, which holds.release gives back."""
    key = str(uuid.uuid4())
    await holds.hold(company_id, key)

    return key


async def held_between(key: str, days_set_aside: float, days_back: float) -> None:
    """A candidate's credits, set aside and given back that many days ago."""
    now = datetime.now(UTC)
    await holds.release(key)

    async with Session.begin() as session:
        await session.execute(
            update(Hold)
            .where(Hold.key == f"candidate:{key}")
            .values(
                created_at=now - timedelta(days=days_set_aside),
                released_at=now - timedelta(days=days_back),
            )
        )


async def offers(company_id: str, now: datetime | None = None) -> dict:
    """What each top-up of the company can return now, by its Paddle id."""
    async with Session() as session:
        wallet = await ledger.wallet(session, COMPANY, company_id)

        return await refund_offers.refundable(session, wallet, now or datetime.now(UTC))


async def wallet_of(company_id: str):
    async with Session() as session:
        return await ledger.wallet(session, COMPANY, company_id)


async def refunds_of(transaction: str) -> list[Refund]:
    async with Session() as session:
        query = select(Refund).where(Refund.transaction_id == transaction)

        return list(await session.scalars(query.order_by(Refund.created_at)))


async def refund_entries(company_id: str) -> list[Entry]:
    async with Session() as session:
        query = select(Entry).where(Entry.owner_id == company_id, Entry.reason == Reason.REFUND)

        return list(await session.scalars(query))


async def notices(company_id: str) -> list[dict]:
    """The notifications billing saved for the company, as sent to notifications."""
    query = select(OutboxEvent.data).where(
        OutboxEvent.event_type == NOTIFICATION_REQUESTED,
        OutboxEvent.data["recipient_id"].astext == company_id,
    )

    async with Session() as session:
        return list(await session.scalars(query))


def adjustment(transaction: str, total: int, status="approved", id_=None, age_hours=0.0) -> dict:
    """A Paddle refund adjustment, as its API and web hooks give it."""
    return {
        "id": id_ or f"adj_{uuid.uuid4().hex[:12]}",
        "action": "refund",
        "status": status,
        "transaction_id": transaction,
        "currency_code": "USD",
        "totals": {"total": str(total), "currency_code": "USD"},
        "created_at": (datetime.now(UTC) - timedelta(hours=age_hours)).isoformat(),
    }


def refusal(code: int) -> httpx.HTTPStatusError:
    request = httpx.Request("POST", "https://paddle.test")

    return httpx.HTTPStatusError(
        "refused", request=request, response=httpx.Response(code, request=request)
    )


class FakePaddle:
    """Paddle's refunds, with what it does next set by a test: `status` for the adjustment it
    makes, `failure` raised instead, `read_failure` raised reading the transaction, and
    `adjustments` what it lists. `asked` keeps what it was asked to refund."""

    def __init__(self, monkeypatch):
        self.status = "approved"
        self.failure = None
        self.read_failure = None
        self.adjustments = []
        self.asked = []
        monkeypatch.setattr(paddle, "transaction", self.transaction)
        monkeypatch.setattr(paddle, "refund", self.refund)
        monkeypatch.setattr(paddle, "refunds_of", self.refunds_of)

    async def transaction(self, transaction_id, timeout):
        if self.read_failure is not None:
            raise self.read_failure

        return {"details": {"line_items": [{"id": "line_1", "totals": {"total": "5000"}}]}}

    async def refund(self, transaction_id, item):
        self.asked.append(item)

        if self.failure is not None:
            raise self.failure

        total = item.get("amount", "5000")
        made = adjustment(transaction_id, int(total), self.status)
        self.adjustments.insert(0, made)

        return made

    async def refunds_of(self, transaction_id):
        return [item for item in self.adjustments if item["transaction_id"] == transaction_id]
