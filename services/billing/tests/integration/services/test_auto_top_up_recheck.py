"""A charge Paddle didn't answer, against Postgres: looked up half an hour on, credited once if
Paddle took it, tried again only if its records prove it never did, and otherwise left alone,
for a day at most."""

import uuid
from datetime import timedelta

import httpx
import pytest

from billing.constants.credits import Reason
from billing.constants.products import (
    AUTO_TOP_UP_RECHECK_AFTER,
    AUTO_TOP_UP_UNCREDITED_WAIT,
    OwnerType,
)
from billing.integrations import paddle
from billing.repositories import auto_top_ups as rows
from billing.repositories import events, ledger
from billing.services.auto_top_up_charging import check
from billing.services.auto_top_up_recheck import recheck
from billing.services.topups import handle_completed
from tests.integration.conftest import charged
from tests.integration.services.test_auto_top_up_retries import running_low
from tests.integration.transactions import transaction

COMPANY = OwnerType.COMPANY
PAST = AUTO_TOP_UP_RECHECK_AFTER + timedelta(minutes=1)


DAY_ON = AUTO_TOP_UP_UNCREDITED_WAIT + timedelta(minutes=1)
INCOMPLETE = {"id": "txn_billed", "status": "billed", "origin": "subscription_charge"}


def lists(monkeypatch, transactions, records=None):
    """What Paddle lists: its completed transactions, and every one on the subscription (those
    completed if not given)."""

    async def completed_transactions(since):
        return transactions

    async def charges_since(subscription_id, since):
        return transactions if records is None else records

    monkeypatch.setattr(paddle, "completed_transactions", completed_transactions)
    monkeypatch.setattr(paddle, "charges_since", charges_since)


@pytest.fixture
def told(monkeypatch):
    """What the owners would be told, read from what billing saved to send."""
    sent = []
    tell = events.tell

    def keep(session, event):
        sent.append(event)
        tell(session, event)

    monkeypatch.setattr(events, "tell", keep)

    return sent


async def unanswered_charge(acme, sub):
    """A charge Paddle timed out on; returns when it was claimed."""
    await running_low(acme, sub)
    await check(COMPANY, acme)
    row = await transaction(rows.get, COMPANY, acme)

    return row.charged_at


def charges(calls):
    return [call for call in calls if call[0] == "charge"]


def notices(told):
    return [(event["kind"], event["data"]) for event in told if event.get("recipient")]


def test_a_charge_paddle_never_took_is_made_again_once(run, paddle_calls, monkeypatch, told):
    acme = str(uuid.uuid4())
    lists(monkeypatch, [])

    async def scenario():
        at = await unanswered_charge(acme, f"sub_timeout_{uuid.uuid4().hex[:8]}")
        await recheck(at + timedelta(minutes=1))
        early = len(charges(paddle_calls))
        await recheck(at + PAST)

        return early, await transaction(rows.get, COMPANY, acme)

    early, row = run(scenario())

    assert early == 1
    # Tried once more; a second miss tells the company, and stays waiting for the next look.
    assert len(charges(paddle_calls)) == 2
    assert notices(told) == [("auto_top_up_failed", {"reason": "unconfirmed"})]
    assert row.awaiting_answer is True


def test_a_charge_paddle_took_is_credited_and_not_made_again(run, paddle_calls, monkeypatch):
    acme = str(uuid.uuid4())
    sub = f"sub_timeout_{uuid.uuid4().hex[:8]}"

    async def scenario():
        at = await unanswered_charge(acme, sub)
        before = await transaction(ledger.wallet, COMPANY, acme)
        lists(monkeypatch, [charged(sub)])
        await recheck(at + PAST)
        wallet = await transaction(ledger.wallet, COMPANY, acme)

        return before.balance, wallet.balance

    before, after = run(scenario())

    assert after > before
    assert len(charges(paddle_calls)) == 1


@pytest.mark.parametrize(
    "broken",
    [httpx.ConnectError("no answer"), KeyError("origin"), ValueError("not json")],
    ids=["no answer", "a field missing", "not json"],
)
def test_while_paddle_cant_be_read_nothing_is_charged_again(run, paddle_calls, monkeypatch, broken):
    acme = str(uuid.uuid4())

    async def down(*args):
        raise broken

    monkeypatch.setattr(paddle, "completed_transactions", down)
    monkeypatch.setattr(paddle, "charges_since", down)

    async def scenario():
        at = await unanswered_charge(acme, f"sub_timeout_{uuid.uuid4().hex[:8]}")
        await recheck(at + PAST)

        return at, await transaction(rows.get, COMPANY, acme)

    at, row = run(scenario())

    assert len(charges(paddle_calls)) == 1
    assert (row.charged_at, row.awaiting_answer) == (at, True)


def test_an_incomplete_transaction_is_never_charged_again(run, paddle_calls, monkeypatch, told):
    acme = str(uuid.uuid4())
    lists(monkeypatch, [], [INCOMPLETE])

    async def scenario():
        at = await unanswered_charge(acme, f"sub_timeout_{uuid.uuid4().hex[:8]}")
        await recheck(at + PAST)
        await recheck(at + AUTO_TOP_UP_UNCREDITED_WAIT - timedelta(minutes=1))

        return at, await transaction(rows.get, COMPANY, acme)

    at, row = run(scenario())

    assert len(charges(paddle_calls)) == 1
    assert (row.charged_at, row.awaiting_answer) == (at, True)
    assert notices(told) == []


@pytest.mark.parametrize("readable", [True, False], ids=["a transaction", "paddle down"])
def test_a_charge_unknown_after_a_day_stops_and_tells_once(
    run, paddle_calls, monkeypatch, told, readable
):
    acme = str(uuid.uuid4())
    lists(monkeypatch, [], [INCOMPLETE])

    async def down(*args):
        raise httpx.ConnectError("no answer")

    if not readable:
        monkeypatch.setattr(paddle, "completed_transactions", down)
        monkeypatch.setattr(paddle, "charges_since", down)

    async def scenario():
        at = await unanswered_charge(acme, f"sub_timeout_{uuid.uuid4().hex[:8]}")
        await recheck(at + DAY_ON)
        lists(monkeypatch, [], [])
        await recheck(at + DAY_ON + PAST)
        later = at + 2 * DAY_ON

        return await transaction(rows.claim_charge, COMPANY, acme, later)

    claimed = run(scenario())

    assert claimed is None
    assert len(charges(paddle_calls)) == 1
    assert notices(told) == [("auto_top_up_failed", {"reason": "unconfirmed"})]


def test_credits_of_a_charge_stopped_as_unknown_free_the_next(run, paddle_calls, monkeypatch):
    acme = str(uuid.uuid4())
    sub = f"sub_timeout_{uuid.uuid4().hex[:8]}"
    lists(monkeypatch, [], [INCOMPLETE])

    async def scenario():
        at = await unanswered_charge(acme, sub)
        await recheck(at + DAY_ON)
        stopped = await transaction(rows.get, COMPANY, acme)
        await handle_completed(charged(sub))
        wallet = await transaction(ledger.wallet, COMPANY, acme)
        await transaction(
            ledger.reserve,
            COMPANY,
            acme,
            wallet.balance - wallet.reserved - 1,
            "c2",
            Reason.CANDIDATE,
        )
        claimed = await transaction(rows.claim_charge, COMPANY, acme, at + 2 * DAY_ON)

        return stopped, claimed

    stopped, claimed = run(scenario())

    assert stopped.unconfirmed_at is not None
    assert claimed.unconfirmed_at is None


def test_a_charge_answered_is_left_to_its_web_hook(run, paddle_calls, monkeypatch):
    acme = str(uuid.uuid4())
    lists(monkeypatch, [])

    async def scenario():
        at = await unanswered_charge(acme, f"sub_{uuid.uuid4().hex[:12]}")
        await recheck(at + PAST)

        return await transaction(rows.get, COMPANY, acme)

    row = run(scenario())

    assert len(charges(paddle_calls)) == 1
    assert row.awaiting_answer is False
