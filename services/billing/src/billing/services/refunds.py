"""A company refunds its own top-up's unspent credits (the terms' 14-day rule). The credits are
set aside first, under the wallet's lock, so nothing can spend them while Paddle is asked; then
Paddle, the merchant of record, makes the refund; its answer and its web hooks go through the same
idempotent handler."""

import logging
from datetime import UTC, datetime

import httpx
from fastapi import HTTPException, status
from testee_common.events.audit_actions import AuditAction

from billing.constants.credits import Reason
from billing.constants.products import OwnerType
from billing.constants.refunds import (
    REFUND_NOT_AVAILABLE,
    REFUND_READ_TIMEOUT_SECONDS,
    REFUND_REFUSED,
    RefundState,
    RefundStatus,
)
from billing.core.db import Session
from billing.helpers.refunds import hold_key, refund_item
from billing.integrations import paddle
from billing.models.billing import Refund
from billing.repositories import company_actions, ledger, purchases, refunds
from billing.schemas.refunds import RefundOut
from billing.services import outbox as outbox_service
from billing.services import refund_claims
from billing.services.adjustments import handle_adjustment
from billing.services.refund_offers import refundable

logger = logging.getLogger(__name__)


def refund_out(refund: Refund) -> RefundOut:
    refunded = refund.status == RefundStatus.APPROVED

    return RefundOut(
        status=RefundState.REFUNDED if refunded else RefundState.PROCESSING,
        credits=refund.credits,
        amount=str(refund.amount_minor),
        currency=refund.currency,
    )


async def request(company_id: str, transaction_id: str, user_id: str) -> RefundOut:
    """Refunds what the top-up can return now. A second click while one is on its way changes
    nothing and answers with that one."""
    refund, new = await claim(company_id, transaction_id, user_id)

    if not new:
        return refund_out(refund)

    await outbox_service.flush_quietly()
    adjustment = await send(refund)

    if adjustment is not None:
        await handle_adjustment(adjustment)

    async with Session() as session:
        return refund_out(await refunds.get(session, refund.id))


async def claim(company_id: str, transaction_id: str, user_id: str) -> tuple[Refund, bool]:
    """Sets the refund's credits aside and logs who asked, under the wallet's lock, which every
    use of the credits takes too: what's unspent can't change meanwhile. The refund, and whether
    it's a new one (not the one already on its way). 409 when nothing can be refunded."""
    owner = (OwnerType.COMPANY, company_id)

    async with Session.begin() as session:
        if not await purchases.owns(session, *owner, transaction_id):
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Not found")

        wallet = await ledger.locked(session, *owner)
        in_flight = await refunds.in_flight(session, *owner)
        existing = next((row for row in in_flight if row.transaction_id == transaction_id), None)

        if existing is not None:
            return existing, False

        state = (await refundable(session, wallet, datetime.now(UTC))).get(transaction_id)

        if state is None or state.offer is None:
            raise HTTPException(status.HTTP_409_CONFLICT, REFUND_NOT_AVAILABLE)

        offer = state.offer
        refund = refunds.add(
            session, *owner, transaction_id, offer.credits, int(offer.amount), offer.currency
        )
        await session.flush()
        await ledger.reserve(session, *owner, offer.credits, hold_key(refund), Reason.REFUND)
        company_actions.log(session, company_id, user_id, AuditAction.REFUND_REQUESTED)

    return refund, True


async def send(refund: Refund) -> dict | None:
    """Asks Paddle for the refund: its adjustment, or None when the answer was lost, and the
    refund may or may not exist. Then the credits stay aside for its web hook, or the daily
    reconciliation, to settle (Paddle has no idempotency key to retry with). Paddle refusing, or
    not getting that far, gives the credits back and answers 409."""
    try:
        transaction = await paddle.transaction(refund.transaction_id, REFUND_READ_TIMEOUT_SECONDS)
    except httpx.HTTPError:
        await refused(refund)

    item = refund_item(transaction, refund.amount_minor)

    if item is None:
        await refused(refund)

    try:
        return await paddle.refund(refund.transaction_id, item)
    except httpx.HTTPStatusError as error:
        if error.response.status_code < status.HTTP_500_INTERNAL_SERVER_ERROR:
            await refused(refund)
    except httpx.TransportError:
        pass

    logger.warning("Refund %s has no answer from Paddle: it stays open", refund.id)

    return None


async def refused(refund: Refund) -> None:
    logger.warning("Paddle didn't take refund %s: its credits are given back", refund.id)
    await refund_claims.give_back_unsent(refund.id)
    await outbox_service.flush_quietly()

    raise HTTPException(status.HTTP_409_CONFLICT, REFUND_REFUSED)
