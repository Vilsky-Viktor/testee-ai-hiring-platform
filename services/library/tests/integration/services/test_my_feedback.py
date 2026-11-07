"""A user's own say on a topic's questions, against the real database: their vote and whether
they reported each one (feedback.mine, through topic_questions), and a vote taken back."""

import uuid

from library.core.db import Session
from library.repositories import feedback, preparations
from library.services import question_feedback
from library.services import questions as question_service
from tests.integration.factories import interview
from tests.integration.transactions import transaction


async def a_topic(count=3):
    """A fresh test set's topic and its questions."""
    set_id = await interview(f"Mine {uuid.uuid4()}", questions=count)
    topic = (await transaction(preparations.get_content, set_id)).topics[0]

    return topic, topic.questions


def test_a_user_sees_their_own_votes_and_reports_only(run):
    me, other = f"user-{uuid.uuid4()}", f"user-{uuid.uuid4()}"

    async def scenario():
        topic, [liked, disliked, untouched] = await a_topic()
        await transaction(feedback.rate_question, liked.id, me, 1)
        await transaction(feedback.rate_question, disliked.id, me, -1)
        await transaction(feedback.report_question, disliked.id, me, "unclear", "")
        # Another user's vote and report are theirs alone.
        await transaction(feedback.rate_question, untouched.id, other, -1)
        await transaction(feedback.report_question, untouched.id, other, "unclear", "")

        async with Session() as session:
            ids = [liked.id, disliked.id, untouched.id]
            found = await feedback.mine(session, ids, me)

        _, listed = await question_service.topic_questions(topic.id, me)
        _, anonymous = await question_service.topic_questions(topic.id)

        return (liked, disliked, untouched), found, listed, anonymous

    (liked, disliked, untouched), found, listed, anonymous = run(scenario())

    assert found == ({liked.id: 1, disliked.id: -1}, {disliked.id})
    by_id = {item.id: item for item in listed}
    assert [
        (by_id[q.id].my_rating, by_id[q.id].reported) for q in (liked, disliked, untouched)
    ] == [
        (1, False),
        (-1, True),
        (None, False),
    ]
    # The counts are everyone's: the other user's dislike and report count.
    assert (by_id[untouched.id].dislikes, by_id[untouched.id].reports) == (1, 1)
    # Without a user, nobody's own say.
    assert {(item.my_rating, item.reported) for item in anonymous} == {(None, False)}


def test_a_vote_taken_back_is_gone_and_taking_none_back_is_fine(run):
    me, other = f"user-{uuid.uuid4()}", f"user-{uuid.uuid4()}"

    async def scenario():
        _, [question, *_] = await a_topic(1)
        await transaction(feedback.rate_question, question.id, me, -1)
        await transaction(feedback.rate_question, question.id, other, -1)
        await question_feedback.unrate(question.id, me)
        # Again, with nothing left to take back.
        await question_feedback.unrate(question.id, me)

        async with Session() as session:
            mine = await feedback.my_question_rating(session, question.id, me)
            theirs = await feedback.my_question_rating(session, question.id, other)
            stats = await feedback.question_stats(session, [question.id])

        return mine, theirs, stats[question.id]

    mine, theirs, stats = run(scenario())

    assert (mine, theirs) == (None, -1)
    assert (stats["likes"], stats["dislikes"]) == (0, 1)
