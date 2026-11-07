from datetime import datetime

from billing.constants.credits import Reason
from billing.constants.refunds import REFUND_HOLD_PREFIX, REFUND_WINDOW
from billing.helpers.history import transaction_id
from billing.models.billing import Entry, Hold, Refund
from billing.schemas.refunds import PurchaseLeft


def hold_key(refund: Refund) -> str:
    return f"{REFUND_HOLD_PREFIX}{refund.id}"


def purchases_left(entries: list[Entry], in_flight: list[Refund]) -> list[PurchaseLeft]:
    """Each top-up among `entries` (a wallet's money movements, newest first) with what is left
    of it after its refunds, chargebacks and the refunds still `in_flight`. An adjustment of a
    top-up not among them is left out."""
    found: dict[str, PurchaseLeft] = {}

    for entry in entries:
        if entry.reason == Reason.TOPUP:
            row = found.setdefault(
                transaction_id(entry),
                PurchaseLeft(
                    transaction_id=transaction_id(entry),
                    bought_at=entry.created_at,
                    paid=entry.total_minor or 0,
                    currency=entry.currency or "",
                ),
            )
            row.granted += entry.amount
            row.credits_left += entry.amount

    for entry in entries:
        row = found.get(transaction_id(entry)) if entry.reason != Reason.TOPUP else None

        if row is not None:
            row.credits_left += entry.amount
            # A chargeback reversed adds credits back, and its money.
            row.refunded += (entry.total_minor or 0) * (-1 if entry.amount > 0 else 1)
            row.taken_late += max(-entry.amount, 0) * (entry.created_at > window_end(row))

    for refund in in_flight:
        row = found.get(refund.transaction_id)

        if row is not None:
            row.credits_left -= refund.credits
            row.refunded += refund.amount_minor
            row.taken_late += refund.credits * (refund.created_at > window_end(row))

    return list(found.values())


def window_end(row: PurchaseLeft) -> datetime:
    return row.bought_at + REFUND_WINDOW


def within_rules(
    rows: list[PurchaseLeft], returned: list[Hold], now: datetime
) -> list[PurchaseLeft]:
    """The top-ups that can still be refunded, each with how much: all that's left of one within
    its 14 days; past them, only the `returned` credits set aside before they ended and given
    back after, less what was refunded of it since."""
    allowed = []

    for row in rows:
        ends = window_end(row)
        back = sum(hold.amount for hold in returned if hold.created_at < ends < hold.released_at)
        row.refundable = (
            row.credits_left if now <= ends else min(row.credits_left, back - row.taken_late)
        )

        if row.refundable > 0:
            allowed.append(row)

    return allowed


def money_for(row: PurchaseLeft, credits: int) -> int:
    """The money `credits` of this top-up return, at the price paid per credit, tax included, in
    integers: the buyer's favour on a part of a minor unit, and the last credits take all the
    money left, so several refunds add up to what was paid."""
    left = row.paid - row.refunded

    if credits <= 0 or left <= 0:
        return 0

    if credits >= row.credits_left:
        return left

    return min(-(-row.paid * credits // row.granted), left)


def unspent_shares(rows: list[PurchaseLeft], unspent: int) -> dict[str, tuple[int, int]]:
    """How the wallet's `unspent` paid credits fall among its top-ups, newest first (`rows` are
    in that order), as credits and money by transaction: of paid credits, the oldest count as
    spent first. A top-up with no money left to return gets none."""
    shares = {}

    for row in rows:
        credits = max(min(row.refundable, unspent), 0)
        unspent -= credits
        amount = money_for(row, credits)

        if amount > 0:
            shares[row.transaction_id] = (credits, amount)

    return shares


def refund_item(transaction: dict, amount: int) -> dict | None:
    """The line of a Paddle transaction to refund `amount` of: billing sells one paid line per
    transaction. The whole line when it's all of it. None when nothing was paid."""
    line = next(
        (item for item in transaction["details"]["line_items"] if int(item["totals"]["total"]) > 0),
        None,
    )

    if line is None:
        return None

    if amount == int(line["totals"]["total"]):
        return {"item_id": line["id"], "type": "full"}

    return {"item_id": line["id"], "type": "partial", "amount": str(amount)}
