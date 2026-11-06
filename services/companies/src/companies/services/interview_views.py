"""An interview as its pages and lists show it: its questions' set asked of generation when its
events haven't come yet, its title fetched once from library, and its candidate count."""

import logging
from datetime import UTC, datetime
from uuid import UUID

import httpx
from fastapi import HTTPException, status

from companies.constants.company_status import FINISHED_WINDOW
from companies.constants.interviews import (
    GENERATION_FAILED_STATUS,
    MAX_INTERVIEW_QUESTIONS,
    InterviewStatus,
)
from companies.core.db import Session
from companies.helpers.interview_row import interview_row_status
from companies.helpers.interviews import (
    interview_minutes,
    interview_questions,
    interview_status,
    topics_out,
)
from companies.integrations import billing, library
from companies.integrations import generation as generation_api
from companies.models.companies import Member
from companies.models.interviews import Interview
from companies.repositories import (
    candidates,
    interview_generations,
    interview_notes,
    interview_progress,
    interviews,
)
from companies.schemas.interviews import InterviewDetail, InterviewOut, InterviewStatusCounts
from companies.services import set_cache
from companies.services.access import can_edit

logger = logging.getLogger(__name__)


async def attach_set(interview: Interview) -> Interview:
    """Asks generation once, for a route about this one interview, in case its
    generation.completed or generation.failed hasn't come yet. Lists never ask: they show what
    those events stored."""
    if interview.set_id:
        return interview

    row = await generation_api.get(interview.generation_id, interview.company_id)
    set_id = row.get("preparation_id") if row else None

    if set_id:
        async with Session.begin() as session:
            await interview_generations.set_set_id(session, interview.id, set_id)

        interview.set_id = set_id
        interview.generation_failed = False

        return interview

    failed = bool(row) and row.get("status") == GENERATION_FAILED_STATUS

    if failed != interview.generation_failed:
        async with Session.begin() as session:
            await interview_generations.set_generation_failed(session, interview.id, failed)

        interview.generation_failed = failed

    return interview


async def attach_set_if_reachable(interview: Interview) -> Interview:
    """attach_set for an interview's own page: with generation down, the page shows what
    companies knows instead of failing."""
    try:
        return await attach_set(interview)
    except httpx.HTTPError:
        logger.warning("Generation unreachable; interview %s shown as stored", interview.id)

        return interview


async def interview_title(interview: Interview) -> str | None:
    """The stored title. Interviews finished before titles were stored fetch it once."""
    if interview.title or not interview.set_id:
        return interview.title

    found = await library.get_set(interview.set_id)

    if found:
        async with Session.begin() as session:
            await interviews.set_title(session, interview.id, found["title"])

        interview.title = found["title"]

    return interview.title


async def interview_out(
    interview: Interview, candidate_count: int = 0, notes: tuple = (0, None)
) -> InterviewOut:
    title = await interview_title(interview)

    return InterviewOut(
        id=interview.id,
        generation_id=interview.generation_id,
        set_id=interview.set_id,
        generation_failed=interview.generation_failed,
        title=title,
        question_seconds=interview.question_seconds,
        candidate_count=candidate_count,
        hired=interview.hired,
        pass_mark=interview.pass_mark,
        link_token=interview.link_token,
        status=interview_status(interview.hired, candidate_count),
        created_at=interview.created_at,
        updated_at=interview.updated_at,
        note_count=notes[0],
        pinned_note=notes[1],
        voice=bool(interview.voice),
    )


async def counted_out(rows: list[Interview]) -> list[InterviewOut]:
    """The interviews, each with how many candidates and notes it has and its pinned note,
    counted in one query each."""
    ids = [item.id for item in rows]

    async with Session() as session:
        totals = await candidates.counts(session, ids)
        notes = await interview_notes.summaries(session, ids)

    return [
        await interview_out(item, totals.get(item.id, 0), notes.get(item.id, (0, None)))
        for item in rows
    ]


def _with_progress(out: InterviewOut, found, editor: bool) -> InterviewOut:
    """An interview as the company's list shows it: how its candidates are doing, and the one
    thing to know about it now. `found` is its row of interview_progress.progress, if any."""
    finished = found.finished if found else 0
    passed = found.passed if found else 0
    undelivered = found.undelivered if found else 0
    recent = found.recent if found else 0

    return out.model_copy(
        update={
            "finished_count": finished,
            "passed_count": passed,
            "undelivered_count": undelivered,
            "recent_count": recent,
            "row_status": interview_row_status(
                out.generation_failed,
                out.set_id is not None,
                out.candidate_count,
                undelivered,
                recent,
                editor,
            ),
        }
    )


async def interviews_page(
    company_id,
    offset: int,
    limit: int,
    q: str = "",
    state: InterviewStatus | None = None,
    by_activity: bool = False,
    editor: bool = False,
) -> list[InterviewOut]:
    """A page of the company's interviews, newest first or by latest activity, each with how its
    candidates are doing; `q` narrows them to titles containing it, `state` to those in it."""
    since = datetime.now(UTC) - FINISHED_WINDOW

    async with Session() as session:
        rows = await interview_progress.page(
            session, company_id, offset, limit, q, state, by_activity
        )
        found = await interview_progress.progress(session, [item.id for item in rows], since)

    return [_with_progress(out, found.get(out.id), editor) for out in await counted_out(rows)]


async def status_counts(company_id, q: str = "") -> InterviewStatusCounts:
    """How many of the company's interviews (with `q` in their title) are in each status."""
    async with Session() as session:
        found = await interview_progress.status_counts(session, company_id, q)

    return InterviewStatusCounts(
        all=sum(found.values()),
        **{item.value: found.get(item.value, 0) for item in InterviewStatus},
    )


async def one_out(interview: Interview) -> InterviewOut:
    """The interview with its candidate count."""
    return (await counted_out([interview]))[0]


async def detail(interview: Interview, member: Member) -> InterviewDetail:
    """The interview's own page: its set asked of generation if it can be reached, its topics
    with their number of questions, and the whole test's time."""
    interview = await attach_set_if_reachable(interview)
    base = await one_out(interview)
    found = await set_cache.get_set(interview.set_id) if interview.set_id else None
    topics = topics_out(found, interview) if found else []

    return InterviewDetail(
        **base.model_dump(),
        company_id=interview.company_id,
        language=interview.language,
        topics=topics,
        total_minutes=interview_minutes(found, interview, interview.question_seconds),
        total_questions=interview_questions(found, interview),
        max_questions=MAX_INTERVIEW_QUESTIONS,
        can_edit=can_edit(member),
        keep_private=interview.keep_private,
        discover=await billing.company_paid(interview.company_id),
    )


async def company_interviews(
    company_id, offset: int, limit: int, since: datetime | None, after: UUID | None
) -> list[InterviewOut]:
    """The company's interviews, newest first; with `since`, those changed since, oldest change
    first."""
    async with Session() as session:
        rows = await interviews.list_for_company(session, company_id, offset, limit, since, after)

    return await counted_out(rows)


async def company_interview(company_id: UUID, interview_id: UUID) -> Interview:
    """The interview, if it's the company's; 404 otherwise, as if it weren't there."""
    async with Session() as session:
        interview = await interviews.get(session, interview_id)

    if interview is None or interview.company_id != company_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Interview not found")

    return interview
