"""Interviews copied from templates."""

from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from companies.models.interviews import Interview


async def create(
    session: AsyncSession,
    company_id,
    set_id,
    template_id,
    title: str,
    language: str,
    seconds: int,
) -> Interview:
    """A test whose questions were copied from a template: ready at once, with no generation,
    `seconds` a question (its level's)."""
    interview = Interview(
        company_id=company_id,
        generation_id=None,
        set_id=set_id,
        template_id=template_id,
        title=title,
        language=language,
        question_seconds=seconds,
        ready_at=datetime.now(UTC),
    )

    session.add(interview)
    await session.flush()

    return interview


async def template_uses(session: AsyncSession, company_id, template_ids: list) -> dict:
    """How many of the company's interviews came from each template, by its id."""
    if not template_ids:
        return {}

    query = (
        select(Interview.template_id, func.count())
        .where(Interview.company_id == company_id, Interview.template_id.in_(template_ids))
        .group_by(Interview.template_id)
    )

    return dict((await session.execute(query)).tuples().all())
