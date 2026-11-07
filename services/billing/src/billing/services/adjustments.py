import logging

from testee_common.events.analytics import track

from billing.constants.credits import Reason
from billing.constants.products import ADJUSTMENT_APPROVED
from billing.core.db import Session
from billing.repositories import ledger, purchases, refunds
from billing.repositories.ledger import WalletGone
from billing.services import credit_events, refund_claims
from billing.services import outbox as outbox_service
from billing.services.referrals import take_back_reward

logger = logging.getLogger(__name__)

# Paddle's adjustment action, and whether it takes the credits back (-1) or returns them (+1).
ACTIONS = {
    "refund": (Reason.REFUND, -1),
    "chargeback": (Reason.CHARGEBACK, -1),
    "chargeback_reverse": (Reason.CHARGEBACK_REVERSED, 1),
}


def share(granted: int, adjusted_total: str, paid: int) -> int:
    """The part of the credits a payment bought that an adjustment of `adjusted_total` covers;
    a full refund is all of them."""
    if paid <= 0:
        return 0

    return granted * min(int(adjusted_total), paid) // paid


async def wallet_gone(owner_id: str, data: dict, reward_too: bool) -> None:
    """Its company was deleted, credits and all: nothing to take back but the referral reward
    the top-up paid (`reward_too`), so deleting a referred company can't keep it."""
    await refund_claims.close_for_deleted_wallet(data)

    if reward_too:
        await take_back_reward(owner_id, data["transaction_id"])


async def handle_adjustment(data: dict) -> None:
    """Takes back the credits of an approved refund or a chargeback, and returns them when a
    chargeback is reversed. Each adjustment counts once, however often Paddle sends it. The
    balance may go negative if the credits were spent; then nothing can be spent until a
    top-up covers it. Any refund of a top-up, or a chargeback of all of it, also takes back the
    referral rewards it paid (not returned by a chargeback's reversal: the company's next top-up
    pays them again). A
    company's own refund (services/refunds.py) comes through here too, from Paddle's answer and
    its web hooks: the credits set aside for it are what it takes back, the company is told when
    it's approved, and it's noted while Paddle's approval is pending or when it's rejected."""
    found = ACTIONS.get(data.get("action"))

    if found is None:
        return

    if data.get("status") != ADJUSTMENT_APPROVED:
        await refund_claims.note(data)

        return

    reason, sign = found

    def takes_reward(whole: bool) -> bool:
        return reason == Reason.REFUND or (sign < 0 and whole)

    async with Session() as session:
        bought = await purchases.for_transaction(session, data["transaction_id"])
        existing = bought and await ledger.wallets(session, bought[0], [bought[1]])

    if bought is None:
        logger.warning("Adjustment %s is for a transaction we didn't sell", data["id"])

        return

    owner_type, owner_id, granted, paid = bought

    if owner_id not in existing:
        await wallet_gone(owner_id, data, takes_reward(int(data["totals"]["total"]) >= paid))

        return

    # Several partial refunds of the whole top-up count as a full one.
    # A chargeback reversed gives the credits back: other services hear of it.
    try:
        async with Session.begin() as session:
            refund = await refunds.matching(session, data) if reason == Reason.REFUND else None
            credits = refund.credits if refund else share(granted, data["totals"]["total"], paid)

            if not credits:
                return

            taken = await purchases.take_back(
                session,
                owner_type,
                owner_id,
                sign * credits,
                data["transaction_id"],
                data["id"],
                reason,
                data["totals"]["total"],
                data.get("currency_code"),
                [credit_events.credits_added(owner_type, owner_id)] if sign > 0 else [],
            )

            if refund is not None:
                await refund_claims.approved(session, refund, data["id"])
    except WalletGone:
        await wallet_gone(owner_id, data, takes_reward(int(data["totals"]["total"]) >= paid))

        return

    # Sent now if Pub/Sub takes it; the outbox's next run otherwise.
    if refund is not None:
        await outbox_service.flush_quietly()

    await track(
        "credits_taken_back",
        company_id=owner_id,
        why=reason,
        credits=sign * credits,
    )

    if takes_reward(granted and taken >= granted):
        await take_back_reward(owner_id, data["transaction_id"])
