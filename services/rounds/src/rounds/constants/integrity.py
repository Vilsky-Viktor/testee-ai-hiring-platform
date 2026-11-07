from enum import StrEnum


class IntegritySignal(StrEnum):
    """What the candidate's browser reports during an interview."""

    TAB_LEAVE = "tab_leave"
    COPY = "copy"
    # Back on the page after a leave: not a signal of its own, never saved.
    TAB_RETURN = "tab_return"


# A page leave shorter than this (a notification, a permission prompt, an assistive tool taking
# focus for a moment) is dropped when the candidate comes back. A leave's length is never kept.
# A leave the candidate never came back from counts.
MIN_TAB_LEAVE_SECONDS = 2


# Answers faster than this are too quick to have read the question; the scorecard flags them.
FAST_ANSWER_SECONDS = 3
