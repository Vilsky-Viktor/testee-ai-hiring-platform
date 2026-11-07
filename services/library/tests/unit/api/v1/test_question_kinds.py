import uuid
from types import SimpleNamespace

import pytest
from testee_common.http.http import bearer

from library.repositories import feedback, preparations
from tests.unit.api.v1.test_internal import token

SINGLE = [{"answer": "a", "correct": True}, {"answer": "b", "correct": False}]
MULTI = [
    {"answer": "a", "correct": True},
    {"answer": "b", "correct": True},
    {"answer": "c", "correct": False},
    {"answer": "d", "correct": False},
]
SET_ID = uuid.uuid4()


def question(options):
    return SimpleNamespace(id=uuid.uuid4(), text=f"Q {uuid.uuid4()}?", options=options)


@pytest.fixture
def topic(monkeypatch):
    """A topic of one single-answer and one multi-answer question."""
    found = SimpleNamespace(
        title="Ledgers", subtopics=["Accruals"], questions=[question(SINGLE), question(MULTI)]
    )
    question_set = SimpleNamespace(
        id=SET_ID, kind="template", owner_id="u1", level="hard", language="en"
    )

    async def with_texts(session, topic_id):
        return question_set, found

    async def context(session, question_id):
        return question_set, found

    async def no_stats(session, question_ids):
        return {}

    monkeypatch.setattr(preparations, "get_topic_with_question_texts", with_texts)
    monkeypatch.setattr(preparations, "get_question_context", context)
    monkeypatch.setattr(feedback, "question_stats", no_stats)

    return found


def test_a_topics_questions_say_which_are_multi_answer(client, topic):
    found = client.get(
        f"/internal/sets/{SET_ID}/topics/{uuid.uuid4()}/questions",
        headers=bearer(token(caller="companies")),
    ).json()

    assert [item["multi"] for item in found] == [False, True]


def test_a_topics_questions_carry_the_named_users_own_say(client, topic, monkeypatch):
    single, multi = topic.questions
    asked = []

    async def fake_mine(session, question_ids, user_id):
        asked.append(user_id)

        return {single.id: -1}, {multi.id}

    monkeypatch.setattr(feedback, "mine", fake_mine)
    url = f"/internal/sets/{SET_ID}/topics/{uuid.uuid4()}/questions"

    named = client.get(
        url, params={"user_id": "ann"}, headers=bearer(token(caller="companies"))
    ).json()
    unnamed = client.get(url, headers=bearer(token(caller="companies"))).json()

    assert [(item["my_rating"], item["reported"]) for item in named] == [(-1, False), (None, True)]
    # Without a user, library doesn't look anyone's up.
    assert [(item["my_rating"], item["reported"]) for item in unnamed] == [(None, False)] * 2
    assert asked == ["ann"]


def test_a_questions_context_says_whether_it_is_multi_answer(client, topic):
    single, multi = topic.questions

    def context(item):
        return client.get(
            f"/internal/questions/{item.id}/context", headers=bearer(token(caller="companies"))
        ).json()

    assert (context(single)["multi"], context(multi)["multi"]) == (False, True)


def test_a_questions_context_says_whether_it_shows_an_example(client, topic):
    plain, shown = topic.questions
    shown.text = "What does it print?\n```python\nprint(1)\n```"

    def context(item):
        return client.get(
            f"/internal/questions/{item.id}/context", headers=bearer(token(caller="companies"))
        ).json()

    assert (context(plain)["example"], context(shown)["example"]) == (False, True)
