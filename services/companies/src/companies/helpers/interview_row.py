"""The one thing a company's interview list says about an interview now."""


def interview_row_status(
    failed: bool,
    generated: bool,
    candidates: int,
    undelivered: int,
    recent: int,
    can_edit: bool,
) -> str | None:
    """What needs the user first: a generation that failed or is under way; invites that didn't
    arrive and an interview to invite to, for those who can act on them; else candidates who
    finished lately; else nothing."""
    if failed:
        return "failed"

    if not generated:
        return "generating"

    if can_edit and undelivered:
        return "undelivered"

    if recent:
        return "finished"

    return "ready" if can_edit and not candidates else None
