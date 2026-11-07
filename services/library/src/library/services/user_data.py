from testee_common.events.deletions import DeletedCandidate

from library.core.db import Session
from library.repositories import user_data


async def unlink_data(user_id: str) -> None:
    """A deleted person: nothing library keeps points to them any more (user_data.unlink_user),
    in one save; safe to repeat."""
    async with Session.begin() as session:
        await user_data.unlink_user(session, user_id)


async def unlink_candidates(event_id: str, candidates: list[DeletedCandidate]) -> None:
    """Candidates whose invites went: their accounts stay, their link to those interviews'
    questions doesn't, in one save with the event's note."""
    async with Session.begin() as session:
        await user_data.unlink_candidates(session, event_id, candidates)


async def export_data(user_id: str) -> dict:
    async with Session() as session:
        return await user_data.export(session, user_id)
