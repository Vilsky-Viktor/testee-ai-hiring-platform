from datetime import datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, Response, status
from testee_common.auth.auth import CurrentUser
from testee_common.db.paging import PageParams
from testee_common.events.audit_actions import AuditGroup

from companies.constants.audit import ACTION_FILE_NAME, LOG_NOT_OWNER
from companies.schemas.audit import ActionOut
from companies.services import action_log
from companies.services.access import require_owner
from companies.services.file_exports import check_dates, csv_file

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("/{company_id}/actions/export", response_class=Response)
async def export_actions(
    company_id: UUID,
    user: CurrentUser,
    start: Annotated[datetime | None, Query(alias="from")] = None,
    end: Annotated[datetime | None, Query(alias="to")] = None,
) -> Response:
    """The company's action log as a CSV, from `from` and before `to` when given; for the owner
    only, counted per company a day."""
    company = await require_owner(user, company_id, LOG_NOT_OWNER)
    check_dates(start, end)

    return csv_file(await action_log.export(company.id, user.uid, start, end), ACTION_FILE_NAME)


@router.get("/{company_id}/actions")
async def list_actions(
    company_id: UUID,
    user: CurrentUser,
    page: PageParams,
    member_id: UUID | None = None,
    key_id: UUID | None = None,
    group: AuditGroup | None = None,
    start: Annotated[datetime | None, Query(alias="from")] = None,
    end: Annotated[datetime | None, Query(alias="to")] = None,
) -> list[ActionOut]:
    """The company's action log, newest first, each action with who took it and what it was
    about; for the owner only. Only one member's (`member_id`, a joined member), one API key's,
    one group's, or those from `from` and before `to`."""
    company = await require_owner(user, company_id, LOG_NOT_OWNER)
    user_id = None

    if member_id is not None:
        member = next((item for item in company.members if item.id == member_id), None)

        if member is None or member.user_id is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Member not found")

        user_id = member.user_id

    return await action_log.page(
        company.id, page.offset, page.limit, user_id, group, start, end, key_id
    )
