"""The payloads of the deletion events, which the holders of a company's, an interview's, a
candidate's or a user's data consume to delete their own copies: companies' (rounds, library, ats and others) and
accounts' `user.deleted`. Consumers ignore
fields they don't know (tolerant reader); a payload that fails validation can never be handled
(a ValueError: handle_or_drop drops it)."""

import logging
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict
from testee_common.config.sign_in_constants import GUEST_UID_PREFIX

logger = logging.getLogger(__name__)

INTERVIEW_DELETED = "interview.deleted"
COMPANY_DELETED = "company.deleted"
USER_DELETED = "user.deleted"
INTERVIEW_CANDIDATES_DELETED = "interview.candidates_deleted"
GUESTS_DELETED = "guests.deleted"


class InterviewDeleted(BaseModel):
    """An interview went: its questions' set (none while it was still generating) and its
    generation, so each holder finds what it keeps by its own key."""

    model_config = ConfigDict(extra="ignore")

    interview_id: UUID
    company_id: UUID
    set_id: UUID | None = None
    generation_id: UUID | None = None


class CompanyDeleted(BaseModel):
    """A company went, with every interview and candidate of it. `member_ids`: who was in it, as
    their chats about all their companies can hold its data."""

    model_config = ConfigDict(extra="ignore")

    company_id: UUID
    member_ids: list[str] = []


class DeletedCandidate(BaseModel):
    """A signed-in candidate whose invite went: their account and that interview's questions."""

    model_config = ConfigDict(extra="ignore")

    user_id: str
    set_id: UUID


class InterviewCandidatesDeleted(BaseModel):
    """Invites of signed-in candidates went, however they went (removal, retention, or with their
    interview or company): the accounts stay, but their results are gone, so library drops the
    link on what they said about those interviews' questions, and only those. Guests are in
    `guests.deleted`. Named under "interview." so library gets it within its filter (pubsub.tf)."""

    model_config = ConfigDict(extra="ignore")

    candidates: list[DeletedCandidate]


class UserDeleted(BaseModel):
    """A user deleted their account: each holder deletes what it keeps under their id, and
    under their email what it keeps about them as a candidate. Companies has already deleted its
    part (it may refuse, so accounts calls it first); accounts sends it again after a restore
    (its erasures), so a holder deletes whatever a backup brought back. `erased_at` comes with
    those: what a holder keeps under the email from then on is someone's new, say the same
    address invited again, and stays."""

    model_config = ConfigDict(extra="ignore")

    user_id: str
    email: str
    erased_at: datetime | None = None


def guest_ids(event_id: str, data: dict) -> list[str]:
    """The guests a `guests.deleted` event names: only guests' ids are taken, anything else is
    logged and left out."""
    user_ids = data.get("user_ids")

    if not isinstance(user_ids, list):
        logger.error("Dropped malformed guests.deleted event %s", event_id)

        return []

    guests = [
        user_id
        for user_id in user_ids
        if isinstance(user_id, str) and user_id.startswith(GUEST_UID_PREFIX)
    ]

    if len(guests) != len(user_ids):
        logger.error("guests.deleted event %s names a user who isn't a guest", event_id)

    return guests
