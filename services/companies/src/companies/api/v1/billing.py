from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Query, Response
from testee_common.auth.auth import CurrentUser
from testee_common.db.paging import PageParams

from companies.constants.billing import HISTORY_FILE_NAME
from companies.integrations import billing
from companies.schemas.billing import CreditCandidateOut, HistoryEntryOut, SpentOut
from companies.services import credit_history
from companies.services.access import require_editor
from companies.services.file_exports import check_dates, csv_file

# Owners and admins, who top up, see where the credits went and whose invites hold them; viewers
# don't. The company's prices, currency, checkouts, invoices and automatic top-up are billing's
# own routes under the same prefix (the gateway sends them there).
router = APIRouter(prefix="/companies/{company_id}/billing", tags=["companies"])


@router.get("/history")
async def get_history(
    company_id: UUID,
    user: CurrentUser,
    page: PageParams,
    kind: Literal["topups", "charges", "refunds"] | None = None,
) -> list[HistoryEntryOut]:
    """Every movement of the company's credits, newest first, a page at a time; `kind` narrows
    them to one kind."""
    await require_editor(user, company_id)

    return await credit_history.page(company_id, page.offset, page.limit, kind)


@router.get("/history/export", response_class=Response)
async def export_history(
    company_id: UUID,
    user: CurrentUser,
    start: Annotated[datetime | None, Query(alias="from")] = None,
    end: Annotated[datetime | None, Query(alias="to")] = None,
) -> Response:
    """The company's credit movements as a CSV, from `from` and before `to` when given; counted
    per company a day."""
    await require_editor(user, company_id)
    check_dates(start, end)

    return csv_file(
        await credit_history.export(company_id, user.uid, start, end), HISTORY_FILE_NAME
    )


@router.get("/spent")
async def get_spent(company_id: UUID, user: CurrentUser) -> SpentOut:
    """The credits the company's candidates took this calendar month."""
    await require_editor(user, company_id)

    return SpentOut(credits=await billing.company_spent(company_id))


@router.get("/reserved")
async def get_reserved(
    company_id: UUID, user: CurrentUser, page: PageParams
) -> list[CreditCandidateOut]:
    """Candidates invited who haven't finished, whose credits are set aside, newest first."""
    await require_editor(user, company_id)

    return await credit_history.reserved(company_id, page.offset, page.limit)
