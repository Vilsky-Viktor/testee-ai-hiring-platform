import logging
import time
import uuid

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from testee_common.config.constants import RETRY_AFTER
from testee_common.events.notifications import NotificationKind

from library.constants.quality import COPY_FIX_BATCH, COPY_FIX_SECONDS
from library.core.db import Session
from library.repositories import copy_fixes
from library.services.notices import tell_owner

logger = logging.getLogger(__name__)


async def fix_copies(data: dict) -> None:
    """question.fixed: the bank question's copies that still hold its old content get the new
    one, batch after batch, each batch one save with its companies' notifications. Past
    COPY_FIX_SECONDS it answers 503, so Pub/Sub sends the event again and the next push goes on
    with the copies still left; safe to repeat and in any order, as each copy gets the
    original's current content."""
    question_id = uuid.UUID(data["question_id"])
    stop_at = time.monotonic() + COPY_FIX_SECONDS

    while await fix_batch(question_id, data["text"], data["options"]) == COPY_FIX_BATCH:
        if time.monotonic() >= stop_at:
            # Not done yet: Pub/Sub brings the event back for the copies left.
            raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, headers={RETRY_AFTER: "10"})


async def fix_batch(question_id: uuid.UUID, old_text: str, old_options: list[dict]) -> int:
    """One batch of copies given the question's current content, each company told; how many
    were picked. A copy deleted meanwhile is its own failure: the others go on."""
    async with Session.begin() as session:
        content = await copy_fixes.content_of(session, question_id)

        if content is None:
            return 0

        copies = await copy_fixes.stale_copies(session, question_id, old_text, old_options)

        for copy_id in copies:
            await fix_one(session, copy_id, *content)

    return len(copies)


async def fix_one(
    session: AsyncSession, copy_id: uuid.UUID, text: str, options: list[dict]
) -> None:
    try:
        async with session.begin_nested():
            await copy_fixes.fix_copy(session, copy_id, text, options)
    except IntegrityError:
        logger.warning("Copy %s went while it was being fixed", copy_id)

        return

    await tell_owner(session, copy_id, NotificationKind.QUESTION_FIXED)
