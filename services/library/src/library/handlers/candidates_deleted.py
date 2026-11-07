from testee_common.events.deletions import InterviewCandidatesDeleted

from library.services.user_data import unlink_candidates


async def handle(event_id: str, data: dict) -> None:
    """Companies deleted signed-in candidates' invites: what they said about those interviews'
    questions stays, with no link to them."""
    await unlink_candidates(event_id, InterviewCandidatesDeleted.model_validate(data).candidates)
