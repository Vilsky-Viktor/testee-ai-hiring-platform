from datetime import datetime

from testee_common.events.deletions import guest_ids

from billing.services import accounts


async def handle(data: dict, event_id: str, occurred_at: datetime) -> None:
    """Deleted guest invites' guests: their AI costs and limit hits stay, without them. Forgetting
    again forgets nothing more."""
    for user_id in guest_ids(event_id, data):
        await accounts.forget_guest(user_id)
