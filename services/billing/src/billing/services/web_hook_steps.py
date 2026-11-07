import asyncio
import logging
from collections.abc import Awaitable

from billing.constants.products import WEB_HOOK_STEP_SECONDS

logger = logging.getLogger(__name__)


async def within_web_hook(step: Awaitable[object]) -> None:
    """Waits for a best-effort step of a Paddle web hook for at most WEB_HOOK_STEP_SECONDS; past
    that it's left undone, so Paddle gets its answer in time: what the outbox holds goes on its
    next run."""
    try:
        await asyncio.wait_for(step, WEB_HOOK_STEP_SECONDS)
    except TimeoutError:
        logger.warning("A step of a Paddle web hook ran out of time")
