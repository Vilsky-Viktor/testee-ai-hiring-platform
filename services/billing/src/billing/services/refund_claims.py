"""A refund's credits while Paddle decides: set aside before Paddle is asked, so they can't be
spent meanwhile; taken back through the same ledger entry as any refund once approved
(services/adjustments.py); given back if it never happens."""

from sqlalchemy.ext.asyncio import AsyncSession
from testee_common.events.notifications import (
    NOTIFICATION_REQUESTED,
    NotificationKind,
    notification,
)

from billing.constants.notifications import COMPANY_BILLING_LINK
from billing.constants.refunds import (
    ADJUSTMENT_PENDING,
    ADJUSTMENT_REFUND,
    ADJUSTMENT_REJECTED,
    RefundStatus,
)
from billing.core.db import Session
from billing.helpers.refunds import hold_key
from billing.models.billing import Refund
from billing.repositories import ledger, refunds
from billing.repositories.events import save
from billing.services import credit_events
from billing.services import outbox as outbox_service


async def closed(session: AsyncSession, refund: Refund, adjustment_id: str) -> None:
    """The credits have been taken back in `session`: their hold ends with no movement of its
    own, so the history shows one refund."""
    await ledger.release(session, hold_key(refund))
    refund.adjustment_id = adjustment_id
    refund.status = RefundStatus.APPROVED


async def approved(session: AsyncSession, refund: Refund, adjustment_id: str) -> None:
    """Closes the refund and tells the company, in one save: only an open refund gets here, so
    a repeated adjustment, reconciliation or a late pending one tells nobody twice."""
    await closed(session, refund, adjustment_id)
    save(session, [notice(refund, NotificationKind.REFUND_APPROVED, adjustment_id)])


async def give_back(
    session: AsyncSession, refund: Refund, status: str, events: list[tuple[str, dict]] = ()
) -> None:
    """The refund won't happen: its credits are available again, and the services waiting for
    credits hear of it, with `events` for the outbox in the same save."""
    await ledger.release(session, hold_key(refund))
    refund.status = status
    save(session, [credit_events.credits_added(refund.owner_type, refund.owner_id), *events])


def notice(refund: Refund, kind: NotificationKind, adjustment_id: str) -> tuple[str, dict]:
    """Paddle decided the refund: for the bell, Slack and an email to the company's owners and
    admins, with what it returned or would have. One per adjustment."""
    return NOTIFICATION_REQUESTED, notification(
        refund.owner_type,
        refund.owner_id,
        kind,
        COMPANY_BILLING_LINK.format(owner_id=refund.owner_id),
        key=adjustment_id,
        credits=refund.credits,
        price=refund.amount_minor,
        currency=refund.currency,
    )


async def give_back_unsent(refund_id) -> None:
    """Paddle never took the refund: nothing changes but its status. Once only."""
    async with Session.begin() as session:
        refund = await refunds.locked(session, refund_id)

        if refund.status == RefundStatus.CLAIMED:
            await give_back(session, refund, RefundStatus.FAILED)


async def close_for_deleted_wallet(adjustment: dict) -> None:
    """An approved refund of a company deleted meanwhile: its credits went with it."""
    async with Session.begin() as session:
        refund = await refunds.matching(session, adjustment)

        if refund is not None:
            await closed(session, refund, adjustment["id"])


async def note(adjustment: dict) -> None:
    """A refund's adjustment not approved (yet): awaiting Paddle's approval it's tied to its
    refund; rejected, its credits are given back and the company is told, in one save.
    Safe to repeat and in any order: a closed refund matches nothing, so nobody is told twice."""
    if adjustment.get("action") != ADJUSTMENT_REFUND:
        return

    async with Session.begin() as session:
        refund = await refunds.matching(session, adjustment)

        if refund is None:
            return

        refund.adjustment_id = adjustment["id"]

        if adjustment.get("status") == ADJUSTMENT_REJECTED:
            told = notice(refund, NotificationKind.REFUND_REJECTED, adjustment["id"])
            await give_back(session, refund, RefundStatus.REJECTED, [told])
        elif adjustment.get("status") == ADJUSTMENT_PENDING:
            refund.status = RefundStatus.PENDING

    # Sent now if Pub/Sub takes it; the outbox's next run otherwise.
    await outbox_service.flush_quietly()
