from uuid import UUID

from assistant.services import conversations


async def handle(company_id: UUID, data: dict) -> int:
    """A company was deleted: its conversations go, and its members' about all their companies.
    Returns how many."""
    return await conversations.delete_company(company_id, data.get("member_ids", []))
