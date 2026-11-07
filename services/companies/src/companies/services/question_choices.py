"""A member's say on an interview's questions: an owner or admin leaves a question out (no
candidate gets it) or brings it back; every member likes, dislikes or reports one, once each, as
candidates do."""

from uuid import UUID

from fastapi import HTTPException, Response, status
from testee_common.events.audit_actions import AuditAction
from testee_common.http.http import passed_on

from companies.constants.interviews import NO_QUESTIONS_LEFT
from companies.core.db import Session
from companies.helpers.interviews import set_sizes, topic_limits
from companies.integrations import library
from companies.integrations.question_feedback import client as feedback
from companies.models.interviews import Interview
from companies.repositories import audit, excluded_questions

# Library's answers a member's feedback passes on: a repeat report (409), a reason or comment it
# refuses (422), its daily limits (429).
FEEDBACK_ANSWERS = {
    status.HTTP_409_CONFLICT,
    status.HTTP_422_UNPROCESSABLE_CONTENT,
    status.HTTP_429_TOO_MANY_REQUESTS,
}


async def set_excluded(
    interview: Interview, topic_id: UUID, question_id: UUID, excluded: bool, user_id: str
) -> None:
    """Leaves the topic's question out, or brings it back. Refused (422) when it would leave
    candidates no question at all; a topic's number of questions is never more than it has
    left."""
    questions = await library.get_topic_questions(interview.set_id, topic_id)

    if questions is None or str(question_id) not in {str(item["id"]) for item in questions}:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Question not found")

    found = await library.get_set(interview.set_id) or {}
    topic, question = str(topic_id), str(question_id)

    def change(stored: dict[str, list[str]], limits: dict[str, int]) -> dict[str, list[str]]:
        others = [item for item in stored.get(topic, []) if item != question]
        after = {**stored, topic: [*others, question] if excluded else others}

        if not sum(topic_limits(set_sizes(found, after), limits).values()):
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, NO_QUESTIONS_LEFT)

        return {key: items for key, items in after.items() if items}

    async with Session.begin() as session:
        await excluded_questions.change(session, interview.id, change)
        await audit.record_interview(
            session, interview, user_id, AuditAction.INTERVIEW_SETTINGS_CHANGED
        )


async def interview_question(interview: Interview, question_id: UUID) -> None:
    """Refuses (404) a question that isn't one of the interview's."""
    context = await library.get_question_context(question_id)

    if context is None or str(context["set_id"]) != str(interview.set_id):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Question not found")


def answered(response) -> Response:
    passed_on(response, FEEDBACK_ANSWERS)

    return Response(response.content, response.status_code, media_type="application/json")


async def rate(interview: Interview, question_id: UUID, value: int, user_id: str) -> Response:
    """The member's like (1) or dislike (-1); rating again changes it."""
    await interview_question(interview, question_id)

    return answered(await feedback.rate(question_id, user_id, value))


async def unrate(interview: Interview, question_id: UUID, user_id: str) -> Response:
    """Takes the member's like or dislike back."""
    await interview_question(interview, question_id)

    return answered(await feedback.unrate(question_id, user_id))


async def report(
    interview: Interview, question_id: UUID, reason: str, comment: str, user_id: str
) -> Response:
    """The member's report, once per member and question (a second is 409); it goes to the
    verifier as a candidate's does."""
    await interview_question(interview, question_id)

    return answered(await feedback.report(question_id, user_id, reason, comment))
