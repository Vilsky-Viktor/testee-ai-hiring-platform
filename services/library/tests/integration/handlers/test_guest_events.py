"""A deleted guest invite's guest loses its link in library: its ratings and reports of questions
stay, with no link to it (tests/integration/repositories/test_user_data.py shows what's left)."""

import uuid

import httpx
from event_pushes import push

from library.handlers.dispatch import handle
from library.main import app
from library.repositories import feedback
from tests.integration.factories import a_company, interview, question_ids
from tests.integration.transactions import transaction


def test_a_deleted_guests_link_goes_and_others_stay_however_often_it_comes(run):
    guest, other = f"guest-{uuid.uuid4()}", f"user-{uuid.uuid4()}"

    async def scenario():
        set_id = await interview("Guests")
        first, second, _ = await question_ids(set_id)

        for user_id in (guest, other):
            await transaction(feedback.rate_question, first, user_id, 1)

        await transaction(feedback.report_question, second, guest, "unclear", "Two answers fit.")
        # A user who isn't a guest is never taken from this event.
        event = push("guests.deleted", {"user_ids": [guest, other]}, str(uuid.uuid4()))
        transport = httpx.ASGITransport(app=app)

        async with httpx.AsyncClient(transport=transport, base_url="http://library") as client:
            codes = [(await client.post("/internal/events", json=event)).status_code for _ in "ab"]

        return (
            codes,
            await transaction(feedback.my_question_rating, first, guest),
            await transaction(feedback.has_reported, second, guest),
            await transaction(feedback.my_question_rating, first, other),
            await transaction(feedback.question_stats, [first]),
        )

    codes, rating, reported, other_rating, stats = run(scenario())

    assert codes == [204, 204]
    assert (rating, reported) == (None, False)
    assert other_rating == 1
    # Both votes still count.
    assert list(stats.values()) == [{"likes": 2, "dislikes": 0, "reports": 0}]


def test_a_guests_event_works_before_and_after_its_interview_goes(run):
    """Order free: the event finds the feedback, or finds it gone with the interview's questions."""
    company = a_company(str(uuid.uuid4()))
    early, late = f"guest-{uuid.uuid4()}", f"guest-{uuid.uuid4()}"

    async def scenario():
        set_id = await interview("Order", owner=company)
        first, second, _ = await question_ids(set_id)
        await transaction(feedback.rate_question, first, early, 1)
        await transaction(feedback.rate_question, second, late, -1)
        await handle("e-1", "guests.deleted", {"user_ids": [early]})
        gone = {
            "interview_id": str(uuid.uuid4()),
            "company_id": company,
            "set_id": str(set_id),
            "generation_id": None,
        }
        await handle("e-2", "interview.deleted", gone)
        await handle("e-3", "guests.deleted", {"user_ids": [late]})

        return await transaction(feedback.question_stats, [first, second])

    assert run(scenario()) == {}
