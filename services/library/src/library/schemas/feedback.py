from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from library.constants.feedback import MAX_REPORT_COMMENT_LENGTH, ReportReason


class ReportIn(BaseModel):
    reason: ReportReason
    comment: str = Field(default="", max_length=MAX_REPORT_COMMENT_LENGTH)

    @model_validator(mode="after")
    def require_comment_for_other(self) -> "ReportIn":
        if self.reason is ReportReason.OTHER and not self.comment.strip():
            raise ValueError("Details are required for this reason.")

        return self


class InternalRatingIn(BaseModel):
    """The reader's vote and the one it replaces, by this page's memory (no vote is kept by
    person); `user_id` only counts against their limit."""

    user_id: str
    value: Literal[-1, 1] | None
    previous: Literal[-1, 1] | None = None


class InternalReportIn(ReportIn):
    user_id: str


class ReportOut(BaseModel):
    """A report, anonymous: nothing saved says who made it."""

    id: UUID
    reason: str
    # Empty once REPORT_COMMENT_KEEP_DAYS have passed, and for a replaced question's kept reports.
    comment: str
    created_at: datetime
