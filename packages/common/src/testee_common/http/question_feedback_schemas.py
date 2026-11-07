from typing import Literal

from pydantic import BaseModel


class RatingIn(BaseModel):
    """A thumbs up (1) or down (-1) on a question, or none: a vote is kept with no person, so the
    reader's page says what it replaces (`previous`, its earlier click on this question)."""

    value: Literal[-1, 1] | None
    previous: Literal[-1, 1] | None = None


class ReportIn(BaseModel):
    """A report on a question: library checks the reason and the comment's length."""

    reason: str
    comment: str = ""
