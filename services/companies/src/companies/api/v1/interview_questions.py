from uuid import UUID

from fastapi import APIRouter, HTTPException, Response, status
from testee_common.auth.auth import CurrentUser
from testee_common.db.paging import PageParams
from testee_common.http.question_feedback_schemas import RatingIn, ReportIn

from companies.integrations import library
from companies.models.interviews import Interview
from companies.schemas.interviews import (
    QuestionExcludedIn,
    QuestionText,
    ReportOut,
    TopicLimitIn,
)
from companies.services import interview_changes, question_choices, question_steps
from companies.services.interview_access import interview_for

router = APIRouter(prefix="/interviews", tags=["interviews"])


async def generated_interview(
    user: CurrentUser, interview_id: UUID, editor: bool = False
) -> Interview:
    """The user's interview (interview_for), only one whose questions are made."""
    interview, _, _ = await interview_for(user, interview_id, editor)

    if interview.set_id is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Interview not found")

    return interview


@router.get("/{interview_id}/topics/{topic_id}/questions")
async def list_topic_questions(
    interview_id: UUID, topic_id: UUID, user: CurrentUser
) -> list[QuestionText]:
    """The topic's questions, each with the member's own like or dislike and report, and
    whether an owner or admin left it out."""
    interview = await generated_interview(user, interview_id)
    questions = await library.get_topic_questions(interview.set_id, topic_id, user.uid)

    if questions is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Topic not found")

    excluded = set(interview.excluded_questions.get(str(topic_id), []))

    return [
        QuestionText(**question, excluded=str(question["id"]) in excluded) for question in questions
    ]


@router.put(
    "/{interview_id}/topics/{topic_id}/questions/{question_id}/excluded",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def set_question_excluded(
    interview_id: UUID,
    topic_id: UUID,
    question_id: UUID,
    body: QuestionExcludedIn,
    user: CurrentUser,
) -> None:
    """Leaves the question out of the interview (no candidate gets it), or brings it back: owners
    and admins. 422 when it would leave candidates no question."""
    interview = await generated_interview(user, interview_id, editor=True)
    await question_choices.set_excluded(interview, topic_id, question_id, body.excluded, user.uid)


@router.put("/{interview_id}/questions/{question_id}/rating")
async def rate_question(
    interview_id: UUID, question_id: UUID, body: RatingIn, user: CurrentUser
) -> Response:
    """A member's like (1) or dislike (-1) on one of the interview's questions."""
    interview = await generated_interview(user, interview_id)

    return await question_choices.rate(interview, question_id, body.value, user.uid)


@router.delete("/{interview_id}/questions/{question_id}/rating")
async def unrate_question(interview_id: UUID, question_id: UUID, user: CurrentUser) -> Response:
    """Takes back a member's like or dislike (a click by mistake)."""
    interview = await generated_interview(user, interview_id)

    return await question_choices.unrate(interview, question_id, user.uid)


@router.post("/{interview_id}/questions/{question_id}/reports")
async def report_question(
    interview_id: UUID, question_id: UUID, body: ReportIn, user: CurrentUser
) -> Response:
    """A member's report on one of the interview's questions, once each (409 for a second)."""
    interview = await generated_interview(user, interview_id)

    return await question_choices.report(
        interview, question_id, body.reason, body.comment, user.uid
    )


@router.put("/{interview_id}/topics/{topic_id}/limit", status_code=status.HTTP_204_NO_CONTENT)
async def set_topic_limit(
    interview_id: UUID, topic_id: UUID, body: TopicLimitIn, user: CurrentUser
) -> None:
    """How many of the topic's questions each candidate gets; 0 leaves the topic out. 422 over
    the topic's number of questions, for the last topic with questions, and over 60 questions
    per candidate over all topics (`too_many_questions`): lower another topic first."""
    interview = await generated_interview(user, interview_id, editor=True)
    await interview_changes.set_topic_limit(interview, topic_id, body.limit, user.uid)


@router.post("/{interview_id}/questions/{question_id}/regenerate")
async def regenerate_question(interview_id: UUID, question_id: UUID, user: CurrentUser) -> dict:
    interview = await generated_interview(user, interview_id, editor=True)

    return await question_steps.regenerate(interview, question_id, user.uid)


@router.post(
    "/{interview_id}/questions/{question_id}/wrong", status_code=status.HTTP_204_NO_CONTENT
)
async def mark_wrong(interview_id: UUID, question_id: UUID, user: CurrentUser) -> None:
    """One click: the marked answer is wrong. The verifier checks it and fixes or replaces it."""
    interview = await generated_interview(user, interview_id, editor=True)
    await question_steps.mark_wrong(interview, question_id, user.uid)


@router.get("/{interview_id}/questions/{question_id}/reports")
async def list_question_reports(
    interview_id: UUID, question_id: UUID, user: CurrentUser, page: PageParams
) -> list[ReportOut]:
    """The reports on a question, its candidates' and its members': every member reads them."""
    interview = await generated_interview(user, interview_id)
    reports = await library.get_question_reports(interview.set_id, question_id, page)

    if reports is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Question not found")

    return [ReportOut(**report) for report in reports]
