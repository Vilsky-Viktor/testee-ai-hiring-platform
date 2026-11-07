"""A job-ad link that refuses candidates tells the company, once an hour per interview. A burst
of refusals races for one Redis key, so one notice goes out; the event's id keeps a redelivered
event from storing it twice. The candidate's refusal never depends on it."""

import logging

from testee_common.config.constants import HOUR_SECONDS

from companies.constants.invites import LINK_REFUSED_KEY
from companies.core.db import Session
from companies.helpers.notifications import link_refused
from companies.integrations.redis import get_redis
from companies.repositories import outbox
from companies.services import outbox as outbox_service

logger = logging.getLogger(__name__)


async def tell_company(interview) -> None:
    """Saves the notice unless this hour's is out; a failure frees the hour for the next
    refusal."""
    redis = get_redis()
    key = LINK_REFUSED_KEY.format(interview_id=interview.id)

    try:
        if not await redis.set(key, 1, ex=HOUR_SECONDS, nx=True):
            return

        async with Session.begin() as session:
            outbox.notify(session, link_refused(interview))
    except Exception:
        logger.exception("Couldn't save the link refusal of interview %s", interview.id)
        await forget(interview.id)

        return

    await outbox_service.flush_quietly()


async def forget(interview_id) -> None:
    try:
        await get_redis().delete(LINK_REFUSED_KEY.format(interview_id=interview_id))
    except Exception:
        logger.warning(
            "Couldn't free interview %s's hour, Redis failed", interview_id, exc_info=True
        )
