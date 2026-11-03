from typing import Literal
from uuid import UUID

from pydantic import BaseModel


class SearchResultOut(BaseModel):
    """A company, interview or candidate of the user's companies found by the header's search:
    its name, what it is, and the ids its page is built from."""

    kind: Literal["company", "interview", "candidate"]
    title: str
    company_id: UUID
    # The company the result belongs to, shown under an interview or a candidate.
    company: str
    # The interview a candidate belongs to, shown with the company under the candidate.
    interview: str | None = None
    interview_id: UUID | None = None
    invite_id: UUID | None = None
