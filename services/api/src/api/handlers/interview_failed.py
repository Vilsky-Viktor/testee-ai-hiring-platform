from datetime import datetime

from api.constants.events import INTERVIEW_FAILED
from api.services import webhooks


async def handle(data: dict, event_id: str, occurred_at: datetime) -> None:
    """Making an interview failed: the company's web hooks hear it, each once."""
    await webhooks.interview_state(INTERVIEW_FAILED, data, event_id, occurred_at)
