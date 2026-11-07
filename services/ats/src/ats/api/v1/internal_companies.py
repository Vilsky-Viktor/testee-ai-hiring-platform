from uuid import UUID

from fastapi import APIRouter
from testee_common.http.counts import CountOut

from ats.api.dependencies import ServiceCaller
from ats.core.db import Session
from ats.repositories import ats

router = APIRouter(prefix="/internal/companies", tags=["internal"])


@router.get("/{company_id}/active-count")
async def active_count(company_id: UUID, caller: ServiceCaller) -> CountOut:
    """Companies, for the company's menu: how many of its ATSs are connected and working."""
    async with Session() as session:
        count = await ats.connected_count(session, company_id)

    return CountOut(count=count)
