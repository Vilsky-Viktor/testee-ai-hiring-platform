from datetime import datetime, timedelta

from notifications.constants.bulk import BULK_RECIPIENTS_KEEP_DAYS
from notifications.constants.member_emails import SENT_KEEP_DAYS
from notifications.constants.notes import PENDING_NOTE_HOURS
from notifications.constants.notifications import KEEP_DAYS
from notifications.constants.suppression import SOFT_BOUNCE_DAYS
from notifications.core.db import Session
from notifications.repositories import (
    bulk_recipients,
    notifications,
    pending_notes,
    sent_emails,
    soft_bounces,
)


async def forget_old(now: datetime, until: float) -> None:
    """The sent log's rows older than every window that reads them, soft bounces past their
    window, notes past every digest and the recipients of old bulk sends, a batch at a time,
    none started after `until` (time.monotonic()); the next run deletes the rest."""
    await sent_emails.forget(Session, now.date() - timedelta(days=SENT_KEEP_DAYS), until)
    await soft_bounces.forget(Session, now - timedelta(days=SOFT_BOUNCE_DAYS), until)
    await pending_notes.forget(Session, now - timedelta(hours=PENDING_NOTE_HOURS), until)
    await bulk_recipients.forget(Session, now - timedelta(days=BULK_RECIPIENTS_KEEP_DAYS), until)


async def forget_notifications(now: datetime, until: float) -> None:
    """The bell's notifications past KEEP_DAYS, with the marks of events received then."""
    await notifications.forget(Session, now - timedelta(days=KEEP_DAYS), until)
