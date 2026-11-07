"""Cancelling the subscriptions that keep automatic top-ups' cards in Paddle."""

import logging

import httpx
from fastapi import status
from testee_common.config.constants import HTTP_TIMEOUT_SECONDS
from testee_common.events.unhandleable import final

from billing.constants.products import SUBSCRIPTION_ENDED_STATUS
from billing.core.db import Session
from billing.integrations import paddle
from billing.repositories import auto_top_ups

logger = logging.getLogger(__name__)


async def cancel(subscription_id: str, timeout: float = HTTP_TIMEOUT_SECONDS) -> None:
    """Cancels the subscription; one Paddle has already ended, or no longer has, counts as
    cancelled. Raises otherwise."""
    try:
        await paddle.cancel(subscription_id, timeout)
    except httpx.HTTPStatusError:
        if not await ended(subscription_id, timeout):
            raise


async def ended(subscription_id: str, timeout: float) -> bool:
    try:
        status_now = await paddle.subscription_status(subscription_id, timeout)

        return status_now == SUBSCRIPTION_ENDED_STATUS
    except httpx.HTTPStatusError as error:
        if error.response.status_code != status.HTTP_404_NOT_FOUND:
            raise

        return True


async def cancel_for_deletion(subscription_id: str) -> None:
    """cancel() for a deleted company or account: a refusal no retry changes is logged to cancel
    by hand and the deletion goes on, as the event would otherwise end with nothing deleted. An
    outage still raises, and the deletion is tried again."""
    try:
        await cancel(subscription_id)
    except httpx.HTTPStatusError as error:
        if not final(error):
            raise

        logger.error("Paddle refused to cancel %s for a deletion: cancel it", subscription_id)


async def cancel_for_buyer(buyer_id: str) -> set[str]:
    """Cancels the subscriptions of the automatic top-ups paid with this person's card, so it's
    never charged again; the ones cancelled. If Paddle can't cancel one, this raises and the
    account's deletion is tried again (services/accounts.py)."""
    async with Session() as session:
        rows = await auto_top_ups.of_buyer(session, buyer_id)

    cancelled = {row.subscription_id for row in rows if row.subscription_id}

    for subscription_id in cancelled:
        await cancel_for_deletion(subscription_id)

    return cancelled


async def cancel_quietly(subscription_id: str, timeout: float = HTTP_TIMEOUT_SECONDS) -> None:
    try:
        await paddle.cancel(subscription_id, timeout)
    except Exception:
        logger.exception("Couldn't cancel subscription %s", subscription_id)
