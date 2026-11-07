"""A company asking for a refund, with Paddle faked at its module: approved at once, pending,
refused, or never answering, and asked for twice. The credits never move twice."""

import httpx
import pytest
from fastapi import HTTPException
from sqlalchemy import select
from testee_common.events.audit_actions import AUDIT_RECORDED, AuditAction

from billing.constants.credits import Reason
from billing.constants.refunds import REFUND_NOT_AVAILABLE, REFUND_REFUSED, RefundStatus
from billing.core.db import Session
from billing.models.outbox import OutboxEvent
from billing.repositories import ledger
from billing.services import refunds
from tests.integration.services.refund_world import (
    COMPANY,
    FakePaddle,
    bought,
    company,
    notices,
    refund_entries,
    refunds_of,
    refusal,
    spent,
    transaction_id,
    wallet_of,
)
from tests.integration.transactions import transaction


@pytest.fixture
def fake_paddle(monkeypatch):
    return FakePaddle(monkeypatch)


def test_approved_at_once_takes_the_credits_back_once_and_says_so(run, fake_paddle):
    acme = company()

    async def scenario():
        txn = await bought(acme)
        out = await refunds.request(acme, txn, "ann")

        return out, await wallet_of(acme), await refund_entries(acme), await refunds_of(txn)

    out, wallet, entries, [refund] = run(scenario())

    assert (out.status, out.credits, out.amount, out.currency) == (
        "refunded",
        5_000,
        "5000",
        "USD",
    )
    assert (wallet.balance, wallet.reserved) == (0, 0)
    assert [(entry.amount, entry.total_minor) for entry in entries] == [(-5_000, 5_000)]
    assert refund.status == RefundStatus.APPROVED
    assert fake_paddle.asked == [{"item_id": "line_1", "type": "full"}]


def test_part_of_a_top_up_goes_as_a_partial_refund_of_its_money(run, fake_paddle):
    acme = company()

    async def scenario():
        txn = await bought(acme)
        await spent(acme, 1_000)
        await refunds.request(acme, txn, "ann")

        return await wallet_of(acme)

    wallet = run(scenario())

    assert fake_paddle.asked == [{"item_id": "line_1", "type": "partial", "amount": "4000"}]
    assert wallet.balance == 0


def test_pending_sets_the_credits_aside_so_nothing_can_spend_them(run, fake_paddle):
    fake_paddle.status = "pending_approval"
    acme = company()

    async def scenario():
        txn = await bought(acme)
        out = await refunds.request(acme, txn, "ann")
        can_spend = await transaction(
            ledger.reserve, COMPANY, acme, 500, "candidate:x", Reason.CANDIDATE
        )

        return out, can_spend, await wallet_of(acme), await refunds_of(txn)

    out, can_spend, wallet, [refund] = run(scenario())

    assert out.status == "processing"
    assert can_spend is False
    assert (wallet.balance, wallet.reserved) == (5_000, 5_000)
    assert refund.status == RefundStatus.PENDING
    assert refund.adjustment_id


def test_a_second_click_while_one_is_on_its_way_changes_nothing(run, fake_paddle):
    fake_paddle.status = "pending_approval"
    acme = company()

    async def scenario():
        txn = await bought(acme)
        first = await refunds.request(acme, txn, "ann")
        second = await refunds.request(acme, txn, "ann")

        return first, second, await refunds_of(txn)

    first, second, rows = run(scenario())

    assert first == second
    assert len(rows) == 1
    assert len(fake_paddle.asked) == 1


def test_a_click_after_it_was_refunded_finds_nothing_to_refund(run, fake_paddle):
    acme = company()

    async def scenario():
        txn = await bought(acme)
        await refunds.request(acme, txn, "ann")

        with pytest.raises(HTTPException) as refused:
            await refunds.request(acme, txn, "ann")

        return refused.value

    refused = run(scenario())

    assert (refused.status_code, refused.detail) == (409, REFUND_NOT_AVAILABLE)
    assert len(fake_paddle.asked) == 1


def test_another_companys_top_up_is_not_found(run, fake_paddle):
    acme, other = company(), company()

    async def scenario():
        txn = await bought(other)
        await bought(acme)

        with pytest.raises(HTTPException) as refused:
            await refunds.request(acme, txn, "ann")

        return refused.value.status_code, await wallet_of(other)

    code, wallet = run(scenario())

    assert code == 404
    assert (wallet.balance, wallet.reserved) == (5_000, 0)


@pytest.mark.parametrize(
    "broken",
    [
        {"failure": refusal(400)},
        {"failure": refusal(403)},
        {"read_failure": httpx.ReadTimeout("no answer")},
        {"read_failure": refusal(500)},
    ],
    ids=["refused", "key-short-of-a-permission", "read-times-out", "read-fails"],
)
def test_paddle_refusing_gives_the_credits_back(run, fake_paddle, broken):
    for name, value in broken.items():
        setattr(fake_paddle, name, value)

    acme = company()

    async def scenario():
        txn = await bought(acme)

        with pytest.raises(HTTPException) as refused:
            await refunds.request(acme, txn, "ann")

        return (
            refused.value,
            await wallet_of(acme),
            await refunds_of(txn),
            await refund_entries(acme),
        )

    refused, wallet, [refund], entries = run(scenario())

    assert (refused.status_code, refused.detail) == (409, REFUND_REFUSED)
    assert (wallet.balance, wallet.reserved) == (5_000, 0)
    assert refund.status == RefundStatus.FAILED
    assert entries == []


def test_a_refused_refund_can_be_asked_for_again(run, fake_paddle):
    fake_paddle.failure = refusal(400)
    acme = company()

    async def scenario():
        txn = await bought(acme)

        with pytest.raises(HTTPException):
            await refunds.request(acme, txn, "ann")

        fake_paddle.failure = None

        return await refunds.request(acme, txn, "ann"), await wallet_of(acme)

    out, wallet = run(scenario())

    assert out.status == "refunded"
    assert wallet.balance == 0


@pytest.mark.parametrize(
    "lost",
    [httpx.ReadTimeout("no answer"), refusal(500), refusal(503)],
    ids=["timeout", "500", "503"],
)
def test_a_lost_answer_keeps_the_credits_aside_and_says_its_on_its_way(run, fake_paddle, lost):
    fake_paddle.failure = lost
    acme = company()

    async def scenario():
        txn = await bought(acme)
        out = await refunds.request(acme, txn, "ann")

        return out, await wallet_of(acme), await refunds_of(txn)

    out, wallet, [refund] = run(scenario())

    assert out.status == "processing"
    assert (wallet.balance, wallet.reserved) == (5_000, 5_000)
    assert refund.status == RefundStatus.CLAIMED


def test_asking_is_logged_for_the_action_log_with_who_asked(run, fake_paddle):
    acme = company()

    async def scenario():
        txn = await bought(acme)
        await refunds.request(acme, txn, "ann")
        query = select(OutboxEvent.data).where(
            OutboxEvent.event_type == AUDIT_RECORDED,
            OutboxEvent.data["company_id"].astext == acme,
            OutboxEvent.data["action"].astext == AuditAction.REFUND_REQUESTED,
        )

        async with Session() as session:
            return list(await session.scalars(query))

    [logged] = run(scenario())

    assert logged["user_id"] == "ann"


def test_nothing_is_refunded_for_a_transaction_of_no_company(run, fake_paddle):
    async def scenario():
        with pytest.raises(HTTPException) as refused:
            await refunds.request(company(), transaction_id(), "ann")

        return refused.value.status_code

    assert run(scenario()) == 404


def test_approval_tells_the_company_with_what_went_back(run, fake_paddle):
    acme = company()

    async def scenario():
        txn = await bought(acme)
        await refunds.request(acme, txn, "ann")

        return await notices(acme)

    [told] = run(scenario())

    assert told["kind"] == "refund_approved"
    assert told["recipient"] == "company"
    assert told["link"] == f"/companies/{acme}/billing"
    assert told["data"] == {"credits": 5_000, "price": 5_000, "currency": "USD"}
