import asyncio

from testee_common.events.deletions import guest_ids

from accounts.services.accounts import delete_sign_in
from accounts.services.user_data import delete_data


async def delete_guests(event_id: str, data: dict) -> None:
    """A deleted guest invite's guest goes too: what accounts kept under its sign-in (the terms
    it accepted) and the sign-in itself. Safe to repeat, so a redelivered event changes nothing;
    only guests' ids are taken."""
    for user_id in guest_ids(event_id, data):
        await delete_data(user_id)
        await asyncio.to_thread(delete_sign_in, user_id)
