"""Billing's races against Postgres, each proven: the first call's transaction stays open at its
commit until the second is seen waiting on its lock (testee_common.db.lock_waits), so the two really
overlap. Spending credits, charging a hold, a Paddle top-up and the automatic top-up. The held
transaction is the one its service opens (holds, topups) or, for a repository's own guarded
write, the one tests/integration/transactions.py opens for it."""

import os
import uuid
from datetime import UTC, datetime

from fastapi import HTTPException
from testee_common.db.lock_waits import hold_first_commit, race

from billing.constants.credits import CANDIDATE_CREDITS, WELCOME_COMPANY, Reason
from billing.constants.currencies import Currency
from billing.constants.products import TOP_UPS, OwnerType
from billing.repositories import auto_top_ups, ledger
from billing.services import currencies, holds, refunds, topups
from tests.integration import transactions
from tests.integration.factories import welcomed
from tests.integration.services.test_auto_top_up_price_notices import agreed_at, notices
from tests.integration.services.test_auto_top_up_retries import running_low

COMPANY = OwnerType.COMPANY
NOW = datetime(2026, 10, 3, 12, tzinfo=UTC)


def test_two_holds_at_once_cant_both_take_the_last_credits(run, monkeypatch):
    acme = str(uuid.uuid4())

    async def scenario():
        await welcomed(acme, f"{acme}@example.com")
        held = hold_first_commit(monkeypatch, transactions)
        reserve = (ledger.reserve, COMPANY, acme, WELCOME_COMPANY)
        results = await race(
            os.environ["DATABASE_URL"],
            held,
            transactions.transaction(*reserve, "candidate:a", Reason.CANDIDATE),
            transactions.transaction(*reserve, "candidate:b", Reason.CANDIDATE),
        )

        return results, await transactions.transaction(ledger.wallet, COMPANY, acme)

    results, wallet = run(scenario())

    assert results == (True, False)
    assert (wallet.balance, wallet.reserved) == (WELCOME_COMPANY, WELCOME_COMPANY)


def test_a_hold_charged_twice_at_once_takes_its_credits_once(run, monkeypatch):
    acme = str(uuid.uuid4())
    key = f"candidate:{acme}"

    async def scenario():
        await welcomed(acme, f"{acme}@example.com")
        await holds.hold(acme, acme)
        held = hold_first_commit(monkeypatch, holds)
        await race(os.environ["DATABASE_URL"], held, holds.charge(acme), holds.charge(acme))

        wallet = await transactions.transaction(ledger.wallet, COMPANY, acme)

        return wallet, await transactions.transaction(ledger.hold_status, key)

    wallet, status = run(scenario())

    assert (wallet.balance, wallet.reserved) == (WELCOME_COMPANY - CANDIDATE_CREDITS, 0)
    assert status == "charged"


def test_a_currency_saved_twice_at_once_tells_the_company_once(run, monkeypatch, paddle_calls):
    acme, ann = str(uuid.uuid4()), f"user-{uuid.uuid4()}"

    async def scenario():
        await agreed_at(acme, ann, 4500)
        held = hold_first_commit(monkeypatch, currencies)
        results = await race(
            os.environ["DATABASE_URL"],
            held,
            currencies.choose_company(acme, Currency.GBP),
            currencies.choose_company(acme, Currency.GBP),
        )

        return results, await notices(acme)

    (first, second), told = run(scenario())

    assert (first.auto_top_up_price, second.auto_top_up_price) == (4000, None)
    assert told == 1


def test_a_top_up_paddle_sends_twice_at_once_is_granted_once(run, monkeypatch):
    acme = str(uuid.uuid4())
    top_up = TOP_UPS[0]

    def grant():
        return topups.grant(
            COMPANY, acme, 1_000, 1, f"txn_{acme}", top_up.key, "ann", "1000", "USD", NOW
        )

    async def scenario():
        held = hold_first_commit(monkeypatch, topups)
        results = await race(os.environ["DATABASE_URL"], held, grant(), grant())
        wallet = await transactions.transaction(ledger.wallet, COMPANY, acme)

        return results, wallet.balance

    assert run(scenario()) == ((True, False), 1_000)


def test_two_checks_at_once_charge_the_automatic_top_up_once(run, monkeypatch, paddle_calls):
    acme = str(uuid.uuid4())

    async def scenario():
        await running_low(acme, f"sub_{uuid.uuid4().hex[:12]}")
        held = hold_first_commit(monkeypatch, transactions)
        claim = (auto_top_ups.claim_charge, COMPANY, acme, datetime.now(UTC))

        return await race(
            os.environ["DATABASE_URL"],
            held,
            transactions.transaction(*claim),
            transactions.transaction(*claim),
        )

    first, second = run(scenario())

    assert first is not None
    assert second is None


def test_a_refund_and_a_candidates_hold_at_once_cant_both_take_the_last_credits(run, monkeypatch):
    """The refund claims first: the spending waits on the wallet's lock, then finds nothing."""
    acme = str(uuid.uuid4())
    txn = f"txn_{uuid.uuid4().hex[:26]}"

    async def scenario():
        await topups.grant(
            COMPANY, acme, 500, 1, txn, "topup_50", "ann", "500", "USD", datetime.now(UTC)
        )
        held = hold_first_commit(monkeypatch, refunds)
        spend = transactions.transaction(
            ledger.reserve, COMPANY, acme, 500, "candidate:a", Reason.CANDIDATE
        )
        results = await race(
            os.environ["DATABASE_URL"], held, refunds.claim(acme, txn, "ann"), spend
        )

        return results, await transactions.transaction(ledger.wallet, COMPANY, acme)

    (claimed, spent), wallet = run(scenario())

    assert claimed[1] is True
    assert spent is False
    assert (wallet.balance, wallet.reserved) == (500, 500)


def test_a_candidates_hold_first_leaves_the_refund_nothing_to_take(run, monkeypatch):
    acme = str(uuid.uuid4())
    txn = f"txn_{uuid.uuid4().hex[:26]}"

    async def scenario():
        await topups.grant(
            COMPANY, acme, 500, 1, txn, "topup_50", "ann", "500", "USD", datetime.now(UTC)
        )
        held = hold_first_commit(monkeypatch, transactions)

        async def refund():
            try:
                return await refunds.claim(acme, txn, "ann")
            except HTTPException as refused:
                return refused.status_code

        results = await race(
            os.environ["DATABASE_URL"],
            held,
            transactions.transaction(
                ledger.reserve, COMPANY, acme, 500, "candidate:a", Reason.CANDIDATE
            ),
            refund(),
        )

        return results, await transactions.transaction(ledger.wallet, COMPANY, acme)

    (spent, refused), wallet = run(scenario())

    assert spent is True
    assert refused == 409
    assert (wallet.balance, wallet.reserved) == (500, 500)


def test_two_clicks_at_once_make_one_refund(run, monkeypatch):
    acme = str(uuid.uuid4())
    txn = f"txn_{uuid.uuid4().hex[:26]}"

    async def scenario():
        await topups.grant(
            COMPANY, acme, 500, 1, txn, "topup_50", "ann", "500", "USD", datetime.now(UTC)
        )
        held = hold_first_commit(monkeypatch, refunds)
        results = await race(
            os.environ["DATABASE_URL"],
            held,
            refunds.claim(acme, txn, "ann"),
            refunds.claim(acme, txn, "ann"),
        )

        return results, await transactions.transaction(ledger.wallet, COMPANY, acme)

    ((first, first_new), (second, second_new)), wallet = run(scenario())

    assert (first_new, second_new) == (True, False)
    assert first.id == second.id
    assert wallet.reserved == 500
