"""A company's interviews as its list shows them: by status and latest activity, with how their
candidates are doing."""

from datetime import datetime

from sqlalchemy import case, exists, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from companies.constants.interviews import InterviewStatus
from companies.constants.invites import InviteStatus
from companies.helpers.search import escape_like
from companies.models.interviews import Interview
from companies.models.invites import CandidateInvite


def _status():
    """helpers/interviews.py's interview_status, as a column."""
    invited = exists().where(CandidateInvite.interview_id == Interview.id)

    return case(
        (Interview.hired, InterviewStatus.HIRED.value),
        (invited, InterviewStatus.IN_PROCESS.value),
        else_=InterviewStatus.NEW.value,
    )


def _latest_change():
    """When the interview or one of its candidates last changed."""
    candidate = (
        select(func.max(CandidateInvite.updated_at))
        .where(CandidateInvite.interview_id == Interview.id)
        .scalar_subquery()
    )

    return func.greatest(Interview.updated_at, Interview.created_at, candidate)


def _titled(company_id, q: str) -> list:
    filters = [Interview.company_id == company_id]

    if q:
        filters.append(Interview.title.ilike(f"%{escape_like(q.lower())}%", escape="\\"))

    return filters


async def page(
    session: AsyncSession,
    company_id,
    offset: int,
    limit: int,
    q: str = "",
    status: InterviewStatus | None = None,
    by_activity: bool = False,
) -> list[Interview]:
    """Newest first, or with `by_activity` the latest activity first; `q` narrows them to titles
    containing it as typed, in any case, and `status` to those in it."""
    filters = _titled(company_id, q)

    if status is not None:
        filters.append(_status() == status.value)

    first = _latest_change() if by_activity else Interview.created_at
    query = (
        select(Interview)
        .where(*filters)
        .order_by(first.desc(), Interview.id)
        .offset(offset)
        .limit(limit)
    )

    return list(await session.scalars(query))


async def status_counts(session: AsyncSession, company_id, q: str = "") -> dict[str, int]:
    """How many of the company's interviews (with `q` in their title) are in each status."""
    status = _status()
    query = select(status, func.count()).where(*_titled(company_id, q)).group_by(status)

    return dict((await session.execute(query)).tuples().all())


async def progress(session: AsyncSession, interview_ids: list, since: datetime) -> dict:
    """How each interview's candidates are doing, by id: finished, passed its pass mark,
    undelivered, and finished since `since`; interviews without candidates are missing."""
    if not interview_ids:
        return {}

    finished = CandidateInvite.status == InviteStatus.FINISHED
    query = (
        select(
            CandidateInvite.interview_id,
            func.count().filter(finished).label("finished"),
            func.count()
            .filter(finished, CandidateInvite.grade >= Interview.pass_mark)
            .label("passed"),
            func.count()
            .filter(CandidateInvite.status == InviteStatus.UNDELIVERED)
            .label("undelivered"),
            func.count().filter(CandidateInvite.finished_at >= since).label("recent"),
        )
        .join(Interview, Interview.id == CandidateInvite.interview_id)
        .where(CandidateInvite.interview_id.in_(interview_ids))
        .group_by(CandidateInvite.interview_id)
    )

    return {row.interview_id: row for row in await session.execute(query)}
