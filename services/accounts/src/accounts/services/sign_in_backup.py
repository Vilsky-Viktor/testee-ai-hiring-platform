"""Sign-in accounts exist only in Firebase and every company's rows hang on their ids, which a
new sign-in wouldn't get back: a daily copy in a bucket (jobs/restore_sign_ins.py restores it)."""

import asyncio
import json
import logging
from datetime import UTC, datetime

from firebase_admin import auth as firebase_auth

from accounts.config import settings
from accounts.helpers.sign_in_backup import stored
from accounts.integrations import backup_bucket

logger = logging.getLogger(__name__)


def export() -> list[dict]:
    return [stored(account) for account in firebase_auth.list_users().iterate_all()]


async def back_up(now: datetime | None = None) -> None:
    """Writes every account to a new file; the bucket's lifecycle removes it after 14 days. Named
    to the second, as this service may add files but not replace them. Off where no bucket is
    set (the local stack)."""
    if not settings.sign_in_backup_bucket:
        return

    accounts = await asyncio.to_thread(export)
    name = f"sign-ins-{(now or datetime.now(UTC)).strftime('%Y-%m-%dT%H-%M-%S')}.json"
    await asyncio.to_thread(
        backup_bucket.save, settings.sign_in_backup_bucket, name, json.dumps(accounts)
    )
    logger.info("Backed up %d sign-in accounts", len(accounts))
