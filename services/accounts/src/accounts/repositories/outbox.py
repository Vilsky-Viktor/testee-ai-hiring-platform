from datetime import UTC, datetime, timedelta

from sqlalchemy import or_
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from testee_common.db.db import delete_in_batches
from testee_common.events import outbox
from testee_common.events.deletions import USER_DELETED

from accounts.constants.accounts import UNPUBLISHED_DELETION_HOURS
from accounts.models.outbox import OutboxEvent


def add(session: AsyncSession, event_type: str, data: dict) -> None:
    """Keeps the event with the transaction's change, until it's published."""
    outbox.add(session, OutboxEvent, event_type, data)


async def forget_deletions(sessions: async_sessionmaker) -> None:
    """`user.deleted` events published, or unpublished for hours (the replay sends them again):
    they hold an email, which erasures alone keeps for its days. Batched."""
    late = datetime.now(UTC) - timedelta(hours=UNPUBLISHED_DELETION_HOURS)
    await delete_in_batches(
        sessions,
        OutboxEvent,
        OutboxEvent.event_type == USER_DELETED,
        or_(OutboxEvent.published_at.is_not(None), OutboxEvent.created_at < late),
    )
