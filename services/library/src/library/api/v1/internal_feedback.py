from uuid import UUID

from fastapi import APIRouter, status

from library.api.dependencies import ServiceCaller
from library.schemas.feedback import InternalRatingIn, InternalReportIn
from library.services import question_feedback

router = APIRouter(prefix="/internal/questions", tags=["internal"])


@router.put("/{question_id}/rating", status_code=status.HTTP_204_NO_CONTENT)
async def rate(question_id: UUID, body: InternalRatingIn, caller: ServiceCaller) -> None:
    """For callers that already checked the user may see this question, e.g. a candidate. The
    user's id, in the body, only counts against their limit; nothing saved names them."""
    await question_feedback.rate(question_id, body.user_id, body.value, body.previous)


@router.post("/{question_id}/reports", status_code=status.HTTP_201_CREATED)
async def report(question_id: UUID, body: InternalReportIn, caller: ServiceCaller) -> None:
    """Anonymous like a vote: the user's id only counts against their limit, against floods
    (with Redis down, not counted)."""
    await question_feedback.report(question_id, body.user_id, body.reason, body.comment)
