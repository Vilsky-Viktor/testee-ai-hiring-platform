"""Reconciliation settles a company's refund whose answer or web hook was lost, going by what
Paddle has; an hour's grace, and two runs change nothing twice."""

from datetime import UTC, datetime, timedelta

import httpx
import pytest
from sqlalchemy import update

from billing.constants.refunds import RefundStatus
from billing.core.db import Session
from billing.integrations import paddle
from billing.models.billing import Refund
from billing.services import reconciliation, refunds
from billing.services.reconciliation import settle_open_refunds
from tests.integration.services.refund_world import (
    FakePaddle,
    adjustment,
    bought,
    company,
    notices,
    refund_entries,
    refunds_of,
    wallet_of,
)


@pytest.fixture
def fake_paddle(monkeypatch):
    return FakePaddle(monkeypatch)


async def unanswered(acme: str, fake_paddle: FakePaddle) -> str:
    """A refund whose answer never came, asked for two hours ago."""
    fake_paddle.failure = httpx.ReadTimeout("no answer")
    txn = await bought(acme)
    await refunds.request(acme, txn, "ann")
    fake_paddle.failure = None

    async with Session.begin() as session:
        await session.execute(
            update(Refund)
            .where(Refund.transaction_id == txn)
            .values(created_at=datetime.now(UTC) - timedelta(hours=2))
        )

    return txn


def now() -> datetime:
    return datetime.now(UTC)


def test_a_lost_answer_paddle_approved_is_counted_once_and_told_once(run, fake_paddle):
    acme = company()

    async def scenario():
        txn = await unanswered(acme, fake_paddle)
        fake_paddle.adjustments.append(adjustment(txn, 5_000, age_hours=2))
        await settle_open_refunds(now())
        await settle_open_refunds(now())

        return (
            await wallet_of(acme),
            await refund_entries(acme),
            await refunds_of(txn),
            await notices(acme),
        )

    wallet, entries, [refund], told = run(scenario())

    assert (wallet.balance, wallet.reserved) == (0, 0)
    assert len(entries) == 1
    assert refund.status == RefundStatus.APPROVED
    assert [notice["kind"] for notice in told] == ["refund_approved"]


def test_the_daily_run_and_the_web_hook_together_tell_once(run, fake_paddle, monkeypatch):
    """The approved list and the open refunds both find it: reconcile counts it once."""
    acme = company()

    async def scenario():
        txn = await unanswered(acme, fake_paddle)
        made = adjustment(txn, 5_000, age_hours=2)
        fake_paddle.adjustments.append(made)

        async def lists(since):
            return []

        async def approved(since):
            return [made]

        monkeypatch.setattr(paddle, "completed_transactions", lists)
        monkeypatch.setattr(paddle, "approved_adjustments", approved)
        await reconciliation.reconcile(now())
        await reconciliation.reconcile(now())

        return await refund_entries(acme), await notices(acme)

    entries, told = run(scenario())

    assert len(entries) == 1
    assert [notice["kind"] for notice in told] == ["refund_approved"]


def test_a_lost_rejection_gives_the_credits_back_and_tells_once(run, fake_paddle):
    acme = company()

    async def scenario():
        txn = await unanswered(acme, fake_paddle)
        fake_paddle.adjustments.append(adjustment(txn, 5_000, status="rejected", age_hours=2))
        await settle_open_refunds(now())
        await settle_open_refunds(now())

        return await wallet_of(acme), await refunds_of(txn), await notices(acme)

    wallet, [refund], told = run(scenario())

    assert (wallet.balance, wallet.reserved) == (5_000, 0)
    assert refund.status == RefundStatus.REJECTED
    assert [notice["kind"] for notice in told] == ["refund_rejected"]


def test_a_refund_paddle_never_got_gives_the_credits_back_without_a_notice(run, fake_paddle):
    acme = company()

    async def scenario():
        txn = await unanswered(acme, fake_paddle)
        await settle_open_refunds(now())

        return await wallet_of(acme), await refunds_of(txn), await notices(acme)

    wallet, [refund], told = run(scenario())

    assert (wallet.balance, wallet.reserved) == (5_000, 0)
    assert refund.status == RefundStatus.FAILED
    assert told == []


def test_an_older_refund_of_the_same_amount_isnt_this_one(run, fake_paddle):
    acme = company()

    async def scenario():
        txn = await unanswered(acme, fake_paddle)
        fake_paddle.adjustments.append(adjustment(txn, 5_000, age_hours=48))
        await settle_open_refunds(now())

        return await wallet_of(acme), await refunds_of(txn)

    wallet, [refund] = run(scenario())

    assert (wallet.balance, wallet.reserved) == (5_000, 0)
    assert refund.status == RefundStatus.FAILED


def test_one_still_pending_in_paddle_stays_open(run, fake_paddle):
    acme = company()

    async def scenario():
        txn = await unanswered(acme, fake_paddle)
        pending = adjustment(txn, 5_000, status="pending_approval", age_hours=2)
        fake_paddle.adjustments.append(pending)
        await settle_open_refunds(now())

        return await wallet_of(acme), await refunds_of(txn)

    wallet, [refund] = run(scenario())

    assert (wallet.balance, wallet.reserved) == (5_000, 5_000)
    assert refund.status == RefundStatus.PENDING
    assert refund.adjustment_id


def test_a_refund_asked_for_within_the_hour_is_left_alone(run, fake_paddle):
    acme = company()

    async def scenario():
        fake_paddle.failure = httpx.ReadTimeout("no answer")
        txn = await bought(acme)
        await refunds.request(acme, txn, "ann")
        fake_paddle.failure = None
        await settle_open_refunds(now())

        return await refunds_of(txn)

    [refund] = run(scenario())

    assert refund.status == RefundStatus.CLAIMED


def test_one_refund_failing_to_settle_leaves_the_others_settled(run, fake_paddle, monkeypatch):
    acme, other = company(), company()

    async def scenario():
        broken = await unanswered(acme, fake_paddle)
        fine = await unanswered(other, fake_paddle)
        real = fake_paddle.refunds_of

        async def refunds_of_fake(transaction_id):
            if transaction_id == broken:
                raise httpx.ConnectError("down")

            return await real(transaction_id)

        monkeypatch.setattr(paddle, "refunds_of", refunds_of_fake)
        await settle_open_refunds(now())

        return await refunds_of(broken), await refunds_of(fine)

    [left], [settled] = run(scenario())

    assert left.status == RefundStatus.CLAIMED
    assert settled.status == RefundStatus.FAILED
