from testee_common.events.deletions import guest_ids

from library.services.user_data import unlink_data


async def delete_guests(event_id: str, data: dict) -> None:
    """A deleted guest invite's guest goes too: its ratings and reports of questions stay, with no
    link to it (accounts deletes the sign-in on the same event). Safe to repeat, so a redelivered
    event changes nothing; only guests' ids are taken."""
    for user_id in guest_ids(event_id, data):
        await unlink_data(user_id)
