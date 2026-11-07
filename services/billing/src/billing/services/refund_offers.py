"""Which of a company's top-ups can be refunded now, and for how much. The terms decide: credits
bought in the last 14 days and not spent, free credits counted as spent first. Credits set aside
for candidates aren't refundable while set aside, and each top-up says how many that holds back;
set aside before its 14 days ended and given back after, they stay refundable for 7 days."""

from datetime import datetime

from sqlalchemy.ext.asyncio import AsyncSession

from billing.constants.credits import CANDIDATE_CREDITS, Reason
from billing.constants.refunds import REFUND_GRACE, REFUND_STATES, REFUND_WINDOW
from billing.helpers.history import transaction_id
from billing.helpers.refunds import purchases_left, unspent_shares, within_rules
from billing.models.billing import Entry, Wallet
from billing.repositories import auto_top_ups, ledger, referrals, refunds
from billing.schemas.refunds import RefundOfferOut, RefundStateOut


async def refundable(
    session: AsyncSession, wallet: Wallet, now: datetime
) -> dict[str, RefundStateOut]:
    """What each top-up of the last 14 days can return now, and what credits set aside hold back
    of it, by transaction. Free credits counted as spent first leaves as unspent paid credits the
    smaller of the paid credits not refunded and the credits available: the available ones past
    the paid ones are free, and whatever was spent or set aside beyond the free ones came out of
    the paid ones. What's held back is the difference were the candidates' credits available."""
    owner = (wallet.owner_type, wallet.owner_id)
    returned = await refunds.returned_since(session, *owner, now - REFUND_GRACE)
    # A top-up past its 14 days counts while a hold given back lately was set aside within them.
    since = min((hold.created_at for hold in returned), default=now) - REFUND_WINDOW
    movements = await refunds.money_movements(session, *owner, since)
    in_flight = await refunds.in_flight(session, *owner)
    rows = within_rules(purchases_left(movements, in_flight), returned, now)

    if not rows:
        return {}

    on_their_way = sum(row.credits for row in in_flight)
    paid = await refunds.paid_credits(session, *owner) - on_their_way
    available = wallet.balance - wallet.reserved
    shares = unspent_shares(rows, min(paid, available))
    # The wallet's holds are candidates' and the refunds' on their way.
    candidates_held = wallet.reserved - on_their_way
    released = unspent_shares(rows, min(paid, available + candidates_held))
    rewarded = await referrals.rewarded_by(session, list(shares))
    auto_top_up = await auto_top_ups.get(session, *owner)
    auto_top_up_on = auto_top_up is not None and auto_top_up.subscription_id is not None
    out = {}

    for row in rows:
        credits, amount = shares.get(row.transaction_id, (0, 0))
        held_back = released.get(row.transaction_id, (0, 0))[0] - credits
        offer = None

        if credits:
            offer = RefundOfferOut(
                credits=credits,
                amount=str(amount),
                currency=row.currency,
                takes_referral=row.transaction_id in rewarded,
                auto_top_up_on=auto_top_up_on,
            )

        out[row.transaction_id] = RefundStateOut(
            offer=offer,
            held_back_credits=held_back,
            held_back_candidates=-(-held_back // CANDIDATE_CREDITS),
        )

    return out


async def states(
    session: AsyncSession, owner_type: str, owner_id: str, entries: list[Entry], now: datetime
) -> dict[str, RefundStateOut]:
    """The refund state of the top-ups among a page of the history, by transaction."""
    ids = {transaction_id(entry) for entry in entries if entry.reason == Reason.TOPUP}

    if not ids:
        return {}

    wallet = (await ledger.wallets(session, owner_type, [owner_id])).get(owner_id)
    found = await refundable(session, wallet, now) if wallet is not None else {}
    latest = await refunds.latest(session, ids)

    return {
        id_: found.get(id_, RefundStateOut()).model_copy(
            update={"status": REFUND_STATES.get(latest.get(id_))}
        )
        for id_ in ids
    }
