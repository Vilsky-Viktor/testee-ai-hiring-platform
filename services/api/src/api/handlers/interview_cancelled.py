from datetime import datetime

from api.services import webhooks


async def handle(data: dict, event_id: str, occurred_at: datetime) -> None:
    """An interview was cancelled before it had questions: the company's web hooks hear it, each
    once."""
    await webhooks.interview_cancelled(data, event_id, occurred_at)
