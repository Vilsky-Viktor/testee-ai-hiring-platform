"""A charge Paddle didn't answer, against Postgres: looked up half an hour on, credited once if
Paddle took it, tried again if it never did, and left alone while Paddle can't be read."""

import uuid
from datetime import timedelta

import httpx
import pytest

from billing.constants.products import AUTO_TOP_UP_RECHECK_AFTER, OwnerType
from billing.integrations import paddle
from billing.repositories import auto_top_ups as rows
from billing.repositories import events, ledger
from billing.services.auto_top_up_charging import check
from billing.services.auto_top_up_recheck import recheck
from tests.integration.conftest import charged
from tests.integration.services.test_auto_top_up_retries import running_low
from tests.integration.transactions import transaction

COMPANY = OwnerType.COMPANY
PAST = AUTO_TOP_UP_RECHECK_AFTER + timedelta(minutes=1)


def lists(monkeypatch, transactions):
    async def completed_transactions(since):
        return transactions

    monkeypatch.setattr(paddle, "completed_transactions", completed_transactions)


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
    assert [event["kind"] for event in told if event.get("recipient")] == ["auto_top_up_failed"]
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


def test_while_paddle_cant_be_read_nothing_is_charged_again(run, paddle_calls, monkeypatch):
    acme = str(uuid.uuid4())

    async def down(since):
        raise httpx.ConnectError("no answer")

    monkeypatch.setattr(paddle, "completed_transactions", down)

    async def scenario():
        at = await unanswered_charge(acme, f"sub_timeout_{uuid.uuid4().hex[:8]}")

        with pytest.raises(httpx.ConnectError):
            await recheck(at + PAST)

        return at, await transaction(rows.get, COMPANY, acme)

    at, row = run(scenario())

    assert len(charges(paddle_calls)) == 1
    assert (row.charged_at, row.awaiting_answer) == (at, True)


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
