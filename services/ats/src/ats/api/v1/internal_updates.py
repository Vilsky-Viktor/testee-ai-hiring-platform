from fastapi import APIRouter

from ats.api.dependencies import ServiceCaller
from ats.schemas.ats import NotInvitedIn, NotInvitedListOut
from ats.services.not_invited import not_invited_between

router = APIRouter(prefix="/internal", tags=["internal"])


@router.post("/candidates/not-invited")
async def candidates_not_invited(body: NotInvitedIn, caller: ServiceCaller) -> NotInvitedListOut:
    """The assistant, for its get_updates tool: each candidate of these companies' ATSs who first
    couldn't be invited after `since` and up to `until`, and still isn't: the newest
    MAX_UPDATES, and how many in all."""
    return await not_invited_between(body.company_ids, body.since, body.until)
