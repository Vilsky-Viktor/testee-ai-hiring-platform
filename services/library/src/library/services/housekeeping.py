import logging
from datetime import UTC, datetime, timedelta

from testee_common.events import processed_events

from library.constants.events import PROCESSED_EVENT_DAYS
from library.constants.feedback import REPORT_COMMENT_KEEP_DAYS
from library.core.db import Session
from library.models.events import ProcessedEvent
from library.repositories import feedback
from library.services import bank, quality

logger = logging.getLogger(__name__)


async def daily() -> None:
    """Sends flags the verifier hasn't acted on to it again, takes out of the shared bank what a
    flag, report or opt-out raced (bank.sweep), and empties old reports' comments and forgets
    old notes of processed events (both in batches, each its own transaction; a run cut off
    goes on the next day)."""
    now = datetime.now(UTC)
    resent = await quality.resend_stale_flags()
    logger.info("Sent %d flagged questions to the verifier again", resent)
    logger.info("Took %d questions out of the shared bank", await bank.sweep())
    cleared = await feedback.clear_old_comments(
        Session, now - timedelta(days=REPORT_COMMENT_KEEP_DAYS)
    )
    logger.info("Emptied %d old report comments", cleared)
    await processed_events.forget(
        Session, ProcessedEvent, now - timedelta(days=PROCESSED_EVENT_DAYS)
    )
