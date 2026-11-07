from uuid import UUID

from assistant.constants.chat import MIN_NAME_NEEDLE
from assistant.services import conversations


async def handle(company_id: UUID, data: dict) -> int:
    """A company erased a candidate: its and its members' conversations that mention them
    (their email, invite or name: answers mostly call them by name) go. Returns how many."""
    needles = [str(data.get("email") or ""), str(data.get("candidate_invite_id") or "")]
    name = str(data.get("name") or "").strip()

    if len(name) >= MIN_NAME_NEEDLE:
        needles.append(name)

    return await conversations.delete_mentioning(company_id, data.get("member_ids", []), needles)
