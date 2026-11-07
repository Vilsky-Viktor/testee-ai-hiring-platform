"""Candidates another service sends: an ATS's (as the member who connected it), or the public
API's (as the key itself)."""

from uuid import UUID

from fastapi import HTTPException, status
from testee_common.auth.user import User
from testee_common.i18n.i18n import CodedError
from testee_common.limits.pause import refuse_if_paused

from companies.constants import error_codes
from companies.constants.invites import OPEN, InviteStatus
from companies.constants.return_urls import RETURN_URL_INVALID
from companies.core.db import Session
from companies.helpers.return_urls import is_return_url
from companies.integrations.redis import get_redis
from companies.repositories import companies, interviews, invites
from companies.schemas.internal_ats import AtsInviteIn
from companies.services import candidate_invites
from companies.services import outbox as outbox_service
from companies.services.access import can_edit, trusted_member


async def invite(interview_id: UUID, body: AtsInviteIn, via: str) -> tuple[UUID, bool]:
    """The invite's id, and whether it was made or sent now: a candidate who already finished or
    whose invite is still open is returned as they are, so a retry emails nobody twice. Refused
    with 503 during the emergency pause, 404 when the interview is gone or not the given
    company's, 409 while it has no questions yet, 403 when the sender is no longer an owner or
    admin, 422 for a return address that isn't https (http only on localhost) (and as
    candidate_invites.invite refuses)."""
    async with Session() as session:
        interview = await interviews.get(session, interview_id)

    if interview is None or body.company_id not in (None, interview.company_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Interview not found")

    if interview.set_id is None:
        raise CodedError(
            status.HTTP_409_CONFLICT,
            "The interview isn't ready yet",
            error_codes.INTERVIEW_NOT_READY,
        )

    await refuse_if_paused(get_redis(), "candidate_invite", interview.company_id, body.sender_id)

    async with Session() as session:
        company = await companies.get(session, interview.company_id)
        found = await invites.find(session, interview_id, str(body.email))

    sender = trusted_member(company, body.sender_id)

    if sender is None or not can_edit(sender):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Only an owner or admin can invite")

    if body.return_url and not is_return_url(body.return_url):
        raise CodedError(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            RETURN_URL_INVALID,
            error_codes.RETURN_URL_INVALID,
        )

    # A candidate who already finished keeps their results, and isn't emailed again; nor is one
    # whose invite is still open: the API's and the ATS's retries invite once.
    if found is not None and found.status in (InviteStatus.FINISHED, *OPEN):
        return found.id, False

    user = User(uid=body.sender_id, email="", email_verified=True)
    sent = await candidate_invites.invite(
        interview,
        company,
        user,
        body.email,
        body.name,
        body.return_url,
        body.sign_in,
        body.theme,
        via=via,
        voice=body.voice,
    )
    await outbox_service.flush_quietly()

    return sent.id, True
