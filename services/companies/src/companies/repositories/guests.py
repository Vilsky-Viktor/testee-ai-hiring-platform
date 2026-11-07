from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from testee_common.config.sign_in_constants import GUEST_UID_PREFIX
from testee_common.events.deletions import (
    INTERVIEW_CANDIDATES_DELETED,
    DeletedCandidate,
    InterviewCandidatesDeleted,
)

from companies.constants.events import GUESTS_DELETED
from companies.models.interviews import Interview
from companies.models.invites import CandidateInvite
from companies.repositories import outbox


async def announce_deleted(session: AsyncSession, *conditions) -> None:
    """Saves, in the caller's transaction, what the invites matching `conditions` it's about to
    delete mean elsewhere: guests.deleted for guests, each one's own sign-in going with its
    invite, and interview.candidates_deleted for signed-in candidates who started, whose accounts
    stay but whose results go, so library unlinks their feedback on that interview's questions."""
    rows = await session.execute(
        select(CandidateInvite.id, CandidateInvite.guest, CandidateInvite.user_id, Interview.set_id)
        .join(Interview, Interview.id == CandidateInvite.interview_id)
        .where(*conditions)
    )
    invites = rows.all()
    user_ids = [f"{GUEST_UID_PREFIX}{invite.id}" for invite in invites if invite.guest]
    candidates = [
        DeletedCandidate(user_id=invite.user_id, set_id=invite.set_id)
        for invite in invites
        if not invite.guest and invite.user_id and invite.set_id
    ]

    if user_ids:
        outbox.add(session, GUESTS_DELETED, {"user_ids": user_ids})

    if candidates:
        data = InterviewCandidatesDeleted(candidates=candidates).model_dump(mode="json")
        outbox.add(session, INTERVIEW_CANDIDATES_DELETED, data)
