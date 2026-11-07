"""The refund rule's arithmetic: what's left of a top-up, what the rules allow of it, what it pays
back in integers, and how a wallet's unspent paid credits fall among its top-ups."""

from datetime import UTC, datetime, timedelta

import pytest

from billing.constants.credits import HoldStatus, Reason
from billing.constants.refunds import REFUND_WINDOW, RefundStatus
from billing.helpers.refunds import (
    money_for,
    purchases_left,
    refund_item,
    unspent_shares,
    within_rules,
)
from billing.models.billing import Entry, Hold, Refund
from billing.schemas.refunds import PurchaseLeft

NOW = datetime(2026, 11, 7, 12, tzinfo=UTC)


def days_ago(days: float) -> datetime:
    return NOW - timedelta(days=days)


def top_up(txn="txn_a", credits=5_000, paid=5_000, at=NOW) -> Entry:
    return Entry(
        key=f"{txn}:topup_50",
        amount=credits,
        reason=Reason.TOPUP,
        total_minor=paid,
        currency="USD",
        created_at=at,
    )


def adjustment(txn="txn_a", credits=-1_000, money=1_000, reason=Reason.REFUND, at=NOW) -> Entry:
    return Entry(
        key=f"adjustment:{txn}:adj",
        amount=credits,
        reason=reason,
        total_minor=money,
        currency="USD",
        created_at=at,
    )


def returned(set_aside: datetime, back: datetime, amount=500) -> Hold:
    return Hold(
        amount=amount,
        status=HoldStatus.RELEASED,
        reason=Reason.CANDIDATE,
        created_at=set_aside,
        released_at=back,
    )


def row(credits_left=5_000, granted=5_000, paid=5_000, refunded=0, at=NOW) -> PurchaseLeft:
    return PurchaseLeft(
        transaction_id="txn_a",
        bought_at=at,
        granted=granted,
        credits_left=credits_left,
        paid=paid,
        refunded=refunded,
        refundable=credits_left,
    )


def test_a_top_up_is_left_with_what_its_refunds_and_chargebacks_took():
    entries = [
        adjustment(),
        adjustment(credits=-500, money=500, reason=Reason.CHARGEBACK),
        adjustment(credits=500, money=500, reason=Reason.CHARGEBACK_REVERSED),
        top_up(),
    ]

    [left] = purchases_left(entries, [])

    assert (left.granted, left.credits_left, left.refunded) == (5_000, 4_000, 1_000)


def test_an_adjustment_of_a_top_up_out_of_view_is_left_out():
    assert purchases_left([adjustment(txn="txn_old"), top_up()], [])[0].refunded == 0


def test_a_refund_on_its_way_counts_as_gone_already():
    on_the_way = Refund(
        transaction_id="txn_a",
        credits=1_500,
        amount_minor=1_500,
        status=RefundStatus.PENDING,
        created_at=NOW,
    )

    [left] = purchases_left([top_up()], [on_the_way])

    assert (left.credits_left, left.refunded) == (3_500, 1_500)


@pytest.mark.parametrize(
    ("age", "refundable"),
    [
        (timedelta(0), 5_000),
        (REFUND_WINDOW, 5_000),
        (REFUND_WINDOW + timedelta(seconds=1), 0),
    ],
)
def test_all_of_a_top_up_is_refundable_within_its_14_days_and_nothing_after(age, refundable):
    allowed = within_rules([row(at=NOW - age)], [], NOW)

    assert [item.refundable for item in allowed] == ([refundable] if refundable else [])


@pytest.mark.parametrize(
    ("set_aside", "back", "refundable"),
    [
        # Set aside within the 14 days, back after them.
        (10, 3, 500),
        # Set aside after the 14 days.
        (5, 3, 0),
        # Back before the 14 days ended.
        (19, 17, 0),
    ],
)
def test_past_its_14_days_only_credits_held_across_the_end_come_back(set_aside, back, refundable):
    rows = [row(at=days_ago(20))]

    allowed = within_rules(rows, [returned(days_ago(set_aside), days_ago(back))], NOW)

    assert sum(item.refundable for item in allowed) == refundable


def test_what_was_refunded_late_comes_off_what_came_back():
    late = row(at=days_ago(20))
    late.taken_late = 500
    holds = [returned(days_ago(10), days_ago(3))]

    assert within_rules([late], holds, NOW) == []


def test_money_is_the_price_paid_per_credit_rounded_up_for_the_buyer():
    # 3333 for 5,000 credits: 1,000 credits are 666.6, so 667.
    assert money_for(row(paid=3_333), 1_000) == 667


def test_the_last_credits_take_all_the_money_left_so_refunds_add_up():
    assert money_for(row(credits_left=1_000, paid=3_333, refunded=2_666), 1_000) == 667


def test_no_money_for_no_credits_or_when_all_of_it_is_back():
    assert money_for(row(), 0) == 0
    assert money_for(row(refunded=5_000), 1_000) == 0


def test_unspent_credits_fall_on_the_newest_top_up_first():
    newest = row(credits_left=5_000)
    newest.transaction_id = "txn_new"
    older = row(credits_left=5_000)
    older.transaction_id = "txn_old"

    assert unspent_shares([newest, older], 6_000) == {
        "txn_new": (5_000, 5_000),
        "txn_old": (1_000, 1_000),
    }


def test_nothing_unspent_shares_nothing_even_below_zero():
    assert unspent_shares([row()], 0) == {}
    assert unspent_shares([row()], -100) == {}


LINE = {"id": "txnitm_1", "totals": {"total": "5000"}}
FREE = {"id": "txnitm_0", "totals": {"total": "0"}}


def transaction(*lines) -> dict:
    return {"details": {"line_items": list(lines)}}


def test_all_of_the_paid_line_is_a_full_refund_and_part_of_it_a_partial_one():
    assert refund_item(transaction(FREE, LINE), 5_000) == {"item_id": "txnitm_1", "type": "full"}
    assert refund_item(transaction(LINE), 1_250) == {
        "item_id": "txnitm_1",
        "type": "partial",
        "amount": "1250",
    }


def test_a_transaction_nothing_was_paid_for_has_no_line_to_refund():
    assert refund_item(transaction(FREE), 100) is None
