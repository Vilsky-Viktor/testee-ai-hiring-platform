from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from companies.constants.invites import InviteStatus
from companies.helpers.search import escape_like
from companies.models.companies import Company, Member
from companies.models.interviews import Interview
from companies.models.invites import CandidateInvite
from companies.repositories.candidates import matches


def member_companies(user_id: str):
    return select(Member.company_id).where(Member.user_id == user_id)


def containing(column, q: str):
    return column.ilike(f"%{escape_like(q.lower())}%", escape="\\")


async def companies(session: AsyncSession, user_id: str, q: str, limit: int) -> list[Company]:
    """The user's companies whose name contains `q`, by name."""
    query = (
        select(Company)
        .where(Company.id.in_(member_companies(user_id)), containing(Company.name, q))
        .order_by(func.lower(Company.name), Company.id)
        .limit(limit)
    )

    return list(await session.scalars(query))


async def interviews(
    session: AsyncSession, user_id: str, q: str, limit: int
) -> list[tuple[Interview, str]]:
    """The interviews of the user's companies whose title contains `q`, newest first, each with
    its company's name; untitled ones (still generating) aren't found."""
    query = (
        select(Interview, Company.name)
        .join(Company, Company.id == Interview.company_id)
        .where(Interview.company_id.in_(member_companies(user_id)), containing(Interview.title, q))
        .order_by(Interview.created_at.desc(), Interview.id)
        .limit(limit)
    )

    return [tuple(row) for row in await session.execute(query)]


async def candidates(
    session: AsyncSession, user_id: str, q: str, limit: int
) -> list[tuple[CandidateInvite, str, str | None]]:
    """The candidates of the user's companies whose email or name contains `q`, newest first,
    each with its company's name and its interview's title; those who deleted their account have
    nothing to find."""
    query = (
        select(CandidateInvite, Company.name, Interview.title)
        .join(Company, Company.id == CandidateInvite.company_id)
        .join(Interview, Interview.id == CandidateInvite.interview_id)
        .where(
            CandidateInvite.company_id.in_(member_companies(user_id)),
            CandidateInvite.status != InviteStatus.DELETED,
            matches(q),
        )
        .order_by(CandidateInvite.created_at.desc(), CandidateInvite.id)
        .limit(limit)
    )

    return [tuple(row) for row in await session.execute(query)]
