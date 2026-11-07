"""Paddle's web hooks about a company's own refund, in any order and more than once: credits move
once, the company is told once, and a referral goes back on any refund (rule 11)."""

import pytest

from billing.constants.credits import REFERRAL_REWARD, WELCOME_COMPANY
from billing.constants.refunds import RefundStatus
from billing.repositories import referrals
from billing.services import accounts, refunds
from billing.services.adjustments import handle_adjustment
from billing.services.referrals import reward_after_top_up
from tests.integration.factories import welcomed
from tests.integration.services.refund_world import (
    COMPANY,
    FakePaddle,
    adjustment,
    bought,
    company,
    notices,
    refund_entries,
    refunds_of,
    spent,
    wallet_of,
)
from tests.integration.transactions import transaction


@pytest.fixture
def fake_paddle(monkeypatch):
    paddle = FakePaddle(monkeypatch)
    paddle.status = "pending_approval"

    return paddle


async def pending(acme: str) -> tuple[str, dict]:
    """A top-up with a refund awaiting Paddle's approval, and that adjustment."""
    txn = await bought(acme)
    await refunds.request(acme, txn, "ann")
    [refund] = await refunds_of(txn)

    return txn, adjustment(txn, refund.amount_minor, id_=refund.adjustment_id)


def test_approved_later_takes_the_credits_back_and_redelivery_changes_nothing(run, fake_paddle):
    acme = company()

    async def scenario():
        _, approved = await pending(acme)
        await handle_adjustment(approved)
        await handle_adjustment(approved)

        return await wallet_of(acme), await refund_entries(acme), await notices(acme)

    wallet, entries, told = run(scenario())

    assert (wallet.balance, wallet.reserved) == (0, 0)
    assert len(entries) == 1
    assert [notice["kind"] for notice in told] == ["refund_approved"]


def test_rejected_gives_the_credits_back_and_tells_once_however_often_it_comes(run, fake_paddle):
    acme = company()

    async def scenario():
        txn, approved = await pending(acme)
        rejected = {**approved, "status": "rejected"}
        await handle_adjustment(rejected)
        await handle_adjustment(rejected)

        return await wallet_of(acme), await refunds_of(txn), await notices(acme)

    wallet, [refund], told = run(scenario())

    assert (wallet.balance, wallet.reserved) == (5_000, 0)
    assert refund.status == RefundStatus.REJECTED
    assert [notice["kind"] for notice in told] == ["refund_rejected"]
    assert told[0]["data"] == {"credits": 5_000, "price": 5_000, "currency": "USD"}
    assert told[0]["key"].endswith(refund.adjustment_id)


def test_a_rejected_top_up_can_be_refunded_again(run, fake_paddle):
    acme = company()

    async def scenario():
        txn, approved = await pending(acme)
        await handle_adjustment({**approved, "status": "rejected"})
        fake_paddle.status = "approved"
        out = await refunds.request(acme, txn, "ann")

        return out, await wallet_of(acme)

    out, wallet = run(scenario())

    assert out.status == "refunded"
    assert wallet.balance == 0


def test_a_pending_coming_after_the_approval_changes_nothing(run, fake_paddle):
    fake_paddle.status = "approved"
    acme = company()

    async def scenario():
        txn = await bought(acme)
        await refunds.request(acme, txn, "ann")
        [refund] = await refunds_of(txn)
        late = adjustment(
            txn, refund.amount_minor, status="pending_approval", id_=refund.adjustment_id
        )
        await handle_adjustment(late)

        return await refunds_of(txn), await wallet_of(acme), await notices(acme)

    [refund], wallet, told = run(scenario())

    assert refund.status == RefundStatus.APPROVED
    assert (wallet.balance, wallet.reserved) == (0, 0)
    assert [notice["kind"] for notice in told] == ["refund_approved"]


def test_a_web_hook_before_paddles_answer_is_the_same_refund(run, fake_paddle, monkeypatch):
    """Paddle's web hook wins the race with its own answer: the answer changes nothing more."""
    acme = company()
    fake_paddle.status = "approved"
    real = fake_paddle.refund

    async def hook_first(transaction_id, item):
        made = await real(transaction_id, item)
        await handle_adjustment(made)

        return made

    monkeypatch.setattr("billing.integrations.paddle.refund", hook_first)

    async def scenario():
        txn = await bought(acme)
        out = await refunds.request(acme, txn, "ann")

        return out, await wallet_of(acme), await refund_entries(acme), await notices(acme)

    out, wallet, entries, told = run(scenario())

    assert out.status == "refunded"
    assert wallet.balance == 0
    assert len(entries) == 1
    assert len(told) == 1


def test_a_refund_made_in_paddle_for_another_amount_leaves_the_open_one_open(run, fake_paddle):
    acme = company()

    async def scenario():
        txn = await bought(acme)
        fake_paddle.failure = None
        await spent(acme, 1_000)
        await refunds.request(acme, txn, "ann")
        await handle_adjustment(adjustment(txn, 100))

        return await refunds_of(txn), await notices(acme)

    [refund], told = run(scenario())

    assert refund.status == RefundStatus.PENDING
    assert told == []


def test_any_self_refund_takes_the_referral_back_from_both_once(run, fake_paddle):
    fake_paddle.status = "approved"
    acme, newco = company(), company()

    async def scenario():
        await welcomed(acme, f"{acme}@example.com")
        await welcomed(newco, f"{newco}@example.com")
        code = await transaction(referrals.code_of, COMPANY, acme)
        await transaction(referrals.record, code, COMPANY, newco, [])
        txn = await bought(newco)
        await reward_after_top_up(COMPANY, newco, txn)
        before = (await wallet_of(acme)).balance
        await spent(newco, 7_000)
        await refunds.request(newco, txn, "ann")
        [refund] = await refunds_of(txn)
        await handle_adjustment(adjustment(txn, refund.amount_minor, id_=refund.adjustment_id))

        return before, await wallet_of(acme), await wallet_of(newco)

    before, referrer, referred = run(scenario())

    assert before == WELCOME_COMPANY + REFERRAL_REWARD
    assert referrer.balance == WELCOME_COMPANY
    # The 500 unspent went with the refund, and the 1,000 reward, already spent, is owed.
    assert referred.balance == -REFERRAL_REWARD


def test_a_company_deleted_while_paddle_decides_is_closed_with_nobody_told(run, fake_paddle):
    acme = company()

    async def scenario():
        txn, approved = await pending(acme)
        await accounts.delete_company(acme)
        await handle_adjustment(approved)

        return await refunds_of(txn), await notices(acme)

    [refund], told = run(scenario())

    assert refund.status == RefundStatus.APPROVED
    assert told == []


def test_a_rejection_of_a_deleted_companys_refund_is_harmless(run, fake_paddle):
    acme = company()

    async def scenario():
        txn, approved = await pending(acme)
        await accounts.delete_company(acme)
        await handle_adjustment({**approved, "status": "rejected"})

        return await refunds_of(txn)

    [refund] = run(scenario())

    assert refund.status == RefundStatus.REJECTED
