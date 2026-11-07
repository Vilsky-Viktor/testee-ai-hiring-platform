from datetime import datetime

from sqlalchemy import case, update
from sqlalchemy.ext.asyncio import AsyncSession

from billing.constants.declines import AUTO_TOP_UP_RETRY_WAITS
from billing.models.billing import AutoTopUp


def _of(owner_type: str, owner_id: str):
    return (AutoTopUp.owner_type == owner_type, AutoTopUp.owner_id == owner_id)


async def declined(session: AsyncSession, owner_type: str, owner_id: str, now: datetime) -> bool:
    """The card declined the charge: one more decline in a row, the next try waits the retry
    wait of that many (AUTO_TOP_UP_RETRY_WAITS), and one past the last pauses it. Whether this
    paused it."""
    count = AutoTopUp.declines + 1
    waits = {index: now + wait for index, wait in enumerate(AUTO_TOP_UP_RETRY_WAITS, start=1)}
    over = count > len(AUTO_TOP_UP_RETRY_WAITS)

    paused = await session.scalar(
        update(AutoTopUp)
        .where(*_of(owner_type, owner_id), AutoTopUp.paused_at.is_(None))
        .values(
            awaiting_answer=False,
            declines=count,
            failed_at=now,
            retry_at=case(waits, value=count, else_=None),
            paused_at=case((over, now), else_=None),
        )
        .returning(AutoTopUp.paused_at)
    )

    return paused is not None


async def pause(session: AsyncSession, owner_type: str, owner_id: str, now: datetime) -> bool:
    """A decline that can't pass later: no charge until the card is updated. Whether this paused
    it (not paused already)."""
    paused = await session.scalar(
        update(AutoTopUp)
        .where(*_of(owner_type, owner_id), AutoTopUp.paused_at.is_(None))
        .values(paused_at=now, retry_at=None)
        .returning(AutoTopUp.owner_id)
    )

    return paused is not None


async def never_made(
    session: AsyncSession, owner_type: str, owner_id: str, charged_at: datetime
) -> bool:
    """The charge of `charged_at` never reached Paddle, so nothing holds off the next. Whether
    it was still that charge."""
    query = (
        update(AutoTopUp)
        .where(
            *_of(owner_type, owner_id),
            AutoTopUp.charged_at == charged_at,
            AutoTopUp.awaiting_answer.is_(True),
        )
        .values(charged_at=None, awaiting_answer=False)
        .returning(AutoTopUp.owner_id)
    )

    return await session.scalar(query) is not None


async def charged(
    session: AsyncSession, owner_type: str, owner_id: str, price: int, currency: str, now: datetime
) -> None:
    """A charge of `price` in `currency` went through: no declines in a row, and that price is
    the one agreed. A new price announced counts from now on once its day has come; in another
    currency (one the company chose since) it no longer applies."""
    due = AutoTopUp.next_price_from <= now
    stale = AutoTopUp.price_currency != currency

    await session.execute(
        update(AutoTopUp)
        .where(*_of(owner_type, owner_id))
        .values(
            awaiting_answer=False,
            declines=0,
            retry_at=None,
            price=price,
            price_currency=currency,
            next_price=case((due | stale, None), else_=AutoTopUp.next_price),
            next_price_from=case((due | stale, None), else_=AutoTopUp.next_price_from),
        )
    )


async def resume(
    session: AsyncSession, subscription_id: str, card_saved_at: datetime
) -> tuple[str, str] | None:
    """The subscription's card was updated at `card_saved_at`: a pause from before then ends and
    the declines start over. `failed_at` stays, so the decline before the pause doesn't hold off
    the next charge (claim_charge). Whose it was, or None when it wasn't paused then (a repeated
    web hook, or one paused again since)."""
    row = (
        await session.execute(
            update(AutoTopUp)
            .where(
                AutoTopUp.subscription_id == subscription_id,
                AutoTopUp.paused_at <= card_saved_at,
            )
            .values(paused_at=None, declines=0, retry_at=None)
            .returning(AutoTopUp.owner_type, AutoTopUp.owner_id)
        )
    ).first()

    return (row.owner_type, row.owner_id) if row else None
