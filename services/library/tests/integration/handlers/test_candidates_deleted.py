"""A signed-in candidate's invite went (companies' interview.candidates_deleted): their account
stays, but the link on what they said about that interview's questions goes, comments too, and
what the same account said in any other interview stays (rule 11: each event counts once, in any
order, and a failure is retried whole)."""

import re
import uuid

import httpx
import pytest
from event_pushes import push
from sqlalchemy import text

from library.core.db import Session
from library.handlers.dispatch import handle
from library.main import app
from library.repositories import feedback, user_data
from tests.integration.bank_factories import bank_rows, shared_interview
from tests.integration.factories import a_company, interview, question_ids
from tests.integration.transactions import transaction

UNLINKED = re.compile(r"unlinked-[0-9a-f-]{36}")
EVENT = "interview.candidates_deleted"
COMMENT = "Ann says two answers fit."


def candidates(user_id: str, set_id) -> dict:
    return {"candidates": [{"user_id": user_id, "set_id": str(set_id)}]}


async def delivered(event: dict) -> int:
    transport = httpx.ASGITransport(app=app)

    async with httpx.AsyncClient(transport=transport, base_url="http://library") as client:
        return (await client.post("/internal/events", json=event)).status_code


async def said(question_id, user_id: str) -> None:
    await transaction(feedback.rate_question, question_id, user_id, -1)
    await transaction(feedback.report_question, question_id, user_id, "unclear", COMMENT)


async def owners(question_id) -> list[str]:
    query = (
        "SELECT user_id FROM question_ratings WHERE question_id = :id "
        "UNION ALL SELECT user_id FROM question_reports WHERE question_id = :id"
    )

    async with Session() as session:
        return list(await session.scalars(text(query), {"id": question_id}))


async def comments(question_id) -> list[str]:
    reports = await transaction(feedback.list_reports, question_id)

    return [report.comment for report in reports]


async def source_and_bank_copy():
    """A question of a company's interview, and its bank copy in another company's interview, a
    row of its own: (first set, its question, second set, the copy)."""
    first_set, [source, *_] = await shared_interview(a_company(str(uuid.uuid4())))
    bank_id = (await bank_rows([source]))[source]
    second_set = await interview(f"Reused {uuid.uuid4()}", owner=a_company(str(uuid.uuid4())))
    copy, *_ = await question_ids(second_set)

    async with Session.begin() as session:
        await session.execute(
            text("UPDATE questions SET bank_question_id = :bank WHERE id = :id"),
            {"bank": bank_id, "id": copy},
        )

    return first_set, source, second_set, copy


@pytest.mark.parametrize("gone_from", ["source", "copy"])
def test_only_that_interviews_feedback_loses_its_link_even_on_a_bank_copy(run, gone_from):
    person, other = f"user-{uuid.uuid4()}", f"user-{uuid.uuid4()}"

    async def scenario():
        first_set, source, second_set, copy = await source_and_bank_copy()
        left, stays, left_set = (
            (source, copy, first_set) if gone_from == "source" else (copy, source, second_set)
        )

        for question in (left, stays):
            await said(question, person)

        await said(left, other)
        before = await transaction(feedback.question_stats, [left, stays])
        code = await delivered(push(EVENT, candidates(person, left_set), str(uuid.uuid4())))

        return (
            code,
            before,
            await transaction(feedback.question_stats, [left, stays]),
            await owners(left),
            await comments(left),
            await comments(stays),
            await transaction(feedback.mine, [left, stays], person),
            await transaction(feedback.mine, [left], other),
            await transaction(user_data.export, person),
            # Still one vote and one report per person where they can still see the question.
            await transaction(feedback.report_question, stays, person, "unclear", ""),
            stays,
            left,
        )

    (
        code,
        before,
        after,
        left_owners,
        left_comments,
        stays_comments,
        mine,
        others,
        exported,
        reported_again,
        stays,
        left,
    ) = run(scenario())

    assert code == 204
    assert after == before
    assert other in left_owners and person not in left_owners
    assert len([owner for owner in left_owners if UNLINKED.fullmatch(owner)]) == 2
    assert sorted(left_comments) == ["", COMMENT]
    assert stays_comments == [COMMENT]
    assert mine == ({stays: -1}, {stays})
    assert others == ({left: -1}, {left})
    assert len(exported["question_votes"]) == len(exported["question_reports"]) == 1
    assert reported_again is False


def test_a_redelivery_leaves_alone_what_a_candidate_invited_again_said_since(run):
    person = f"user-{uuid.uuid4()}"

    async def scenario():
        set_id = await interview(f"Again {uuid.uuid4()}")
        question, *_ = await question_ids(set_id)
        await said(question, person)
        event = push(EVENT, candidates(person, set_id), str(uuid.uuid4()))
        await delivered(event)
        unlinked = sorted(await owners(question))
        await transaction(feedback.rate_question, question, person, 1)
        code = await delivered(event)

        return (
            unlinked,
            code,
            await owners(question),
            question,
            await transaction(feedback.mine, [question], person),
        )

    unlinked, code, owners_after, question, mine = run(scenario())

    assert code == 204
    assert set(unlinked) < set(owners_after)
    assert mine == ({question: 1}, set())


def test_it_works_in_any_order_with_the_interviews_and_the_accounts_deletion(run):
    company = a_company(str(uuid.uuid4()))
    first, second = f"user-{uuid.uuid4()}", f"user-{uuid.uuid4()}"

    async def scenario():
        gone_set = await interview(f"Gone {uuid.uuid4()}", owner=company)
        kept_set = await interview(f"Kept {uuid.uuid4()}", owner=company)
        gone, *_ = await question_ids(gone_set)
        kept, *_ = await question_ids(kept_set)
        await said(gone, first)
        await said(kept, second)
        interview_deleted = {
            "interview_id": str(uuid.uuid4()),
            "company_id": company,
            "set_id": str(gone_set),
            "generation_id": None,
        }
        await handle("e", "interview.deleted", interview_deleted)
        await handle(str(uuid.uuid4()), EVENT, candidates(first, gone_set))
        await handle(str(uuid.uuid4()), "user.deleted", {"user_id": second, "email": ""})
        await handle(str(uuid.uuid4()), EVENT, candidates(second, kept_set))

        return (
            await transaction(feedback.question_stats, [gone]),
            await transaction(feedback.question_stats, [kept]),
            await comments(kept),
        )

    gone_stats, kept_stats, kept_comments = run(scenario())

    assert gone_stats == {}
    assert list(kept_stats.values()) == [{"likes": 0, "dislikes": 1, "reports": 1}]
    assert kept_comments == [""]


def test_a_failure_keeps_everything_and_the_same_event_finishes_it(run, monkeypatch):
    person = f"user-{uuid.uuid4()}"
    event_id = str(uuid.uuid4())

    async def scenario():
        set_id = await interview(f"Failed {uuid.uuid4()}")
        question, *_ = await question_ids(set_id)
        await said(question, person)
        # Too long for the column: the save fails after the reporter's note has gone.
        monkeypatch.setattr(user_data, "UNLINKED_USER_PREFIX", "x" * 200)

        with pytest.raises(Exception, match="too long"):
            await handle(event_id, EVENT, candidates(person, set_id))

        monkeypatch.undo()
        failed = await transaction(feedback.mine, [question], person)
        await handle(event_id, EVENT, candidates(person, set_id))

        return (
            question,
            failed,
            await comments(question),
            await transaction(feedback.mine, [question], person),
        )

    question, failed, left_comments, finished = run(scenario())

    assert failed == ({question: -1}, {question})
    assert left_comments == [""]
    assert finished == ({}, set())


def test_an_event_that_can_never_be_handled_is_dropped_with_nothing_changed(run):
    person = f"user-{uuid.uuid4()}"

    async def scenario():
        set_id = await interview(f"Malformed {uuid.uuid4()}")
        question, *_ = await question_ids(set_id)
        await said(question, person)
        event = push(EVENT, {"candidates": [{"user_id": person}]}, str(uuid.uuid4()))

        return await delivered(event), await comments(question)

    assert run(scenario()) == (204, [COMMENT])
