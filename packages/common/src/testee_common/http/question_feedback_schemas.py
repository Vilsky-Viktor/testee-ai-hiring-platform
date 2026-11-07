from typing import Literal

from pydantic import BaseModel


class RatingIn(BaseModel):
    """A thumbs up (1) or down (-1) on a question."""

    value: Literal[-1, 1]


class ReportIn(BaseModel):
    """A report on a question: library checks the reason and the comment's length."""

    reason: str
    comment: str = ""
