import os
import uuid

import pytest
from fastapi import HTTPException
from testee_common.db.lock_waits import hold_first_commit, race

from companies.repositories import excluded_questions, interview_generations, interviews
from companies.schemas.interviews import InterviewSettings
from tests.integration import factories, transactions
from tests.integration.transactions import transaction


def test_saving_one_setting_keeps_the_others(run):
    async def scenario():
        company = await factories.company(f"Acme {uuid.uuid4()}", "owner", "owner@example.com")
        found = await transaction(interviews.create, company.id, uuid.uuid4(), "en", 60)
        await transaction(
            interviews.update_settings,
            found.id,
            InterviewSettings(question_seconds=45, pass_mark=85),
        )
        await transaction(interviews.update_settings, found.id, InterviewSettings(hired=True))

        return await transaction(interviews.get, found.id)

    saved = run(scenario())

    assert (saved.question_seconds, saved.pass_mark, saved.hired) == (45, 85, True)


def test_a_new_tests_questions_are_shared_until_the_company_keeps_them_out(run):
    async def scenario():
        company = await factories.company(f"Acme {uuid.uuid4()}", "owner", "owner@example.com")
        found = await transaction(interviews.create, company.id, uuid.uuid4(), "en", 60)
        new = (await transaction(interviews.get, found.id)).keep_private
        await transaction(
            interviews.update_settings, found.id, InterviewSettings(keep_private=True)
        )
        kept = await transaction(interviews.get, found.id)
        await transaction(
            interviews.update_settings, found.id, InterviewSettings(keep_private=False)
        )

        return (
            new,
            kept.keep_private,
            kept.hired,
            (await transaction(interviews.get, found.id)).keep_private,
        )

    # Off when made, as the terms say; on and off again leaves the other settings alone.
    assert run(scenario()) == (False, True, False, False)


def test_a_generated_test_takes_its_levels_seconds_once_and_keeps_the_companys_after(run):
    """The first completion gives the level's seconds; a later one (a retried event, a
    regeneration) keeps what the company set since; one without a level keeps the test's."""

    async def scenario():
        company = await factories.company(f"Acme {uuid.uuid4()}", "owner", "owner@example.com")
        found = await transaction(interviews.create, company.id, uuid.uuid4(), "en", 60)
        old = await transaction(interviews.create, company.id, uuid.uuid4(), "en", 60)
        generation = found.generation_id
        await transaction(
            interview_generations.set_generated,
            generation,
            uuid.uuid4(),
            "Backend",
            75,
            {},
            str(uuid.uuid4()),
        )
        first = (await transaction(interviews.get, found.id)).question_seconds
        await transaction(
            interviews.update_settings, found.id, InterviewSettings(question_seconds=45)
        )
        await transaction(
            interview_generations.set_generated,
            generation,
            uuid.uuid4(),
            "Backend",
            75,
            {},
            str(uuid.uuid4()),
        )
        later = (await transaction(interviews.get, found.id)).question_seconds
        await transaction(
            interview_generations.set_generated,
            old.generation_id,
            uuid.uuid4(),
            "Backend",
            None,
            {},
            str(uuid.uuid4()),
        )

        return first, later, (await transaction(interviews.get, old.id)).question_seconds

    assert run(scenario()) == (75, 45, 60)


def test_questions_left_out_are_saved_and_a_refused_change_keeps_them(run):
    topic, question = str(uuid.uuid4()), str(uuid.uuid4())

    def leave_out(stored, limits):
        return {**stored, topic: [question]}

    def refuse(stored, limits):
        raise HTTPException(422, "No")

    async def scenario():
        company = await factories.company(f"Acme {uuid.uuid4()}", "owner", "owner@example.com")
        found = await transaction(interviews.create, company.id, uuid.uuid4(), "en", 60)
        new = (await transaction(interviews.get, found.id)).excluded_questions
        await transaction(excluded_questions.change, found.id, leave_out)

        with pytest.raises(HTTPException):
            await transaction(excluded_questions.change, found.id, refuse)

        return new, (await transaction(interviews.get, found.id)).excluded_questions

    new, saved = run(scenario())

    assert (new, saved) == ({}, {topic: [question]})


def test_two_questions_left_out_at_once_both_stay_out(run, monkeypatch):
    """Two editors at once: the second change waits for the first and builds on it, so neither
    question comes back."""
    topic, first, second = (str(uuid.uuid4()) for _ in range(3))

    def leaving_out(question):
        def change(stored, limits):
            return {**stored, topic: [*stored.get(topic, []), question]}

        return change

    async def scenario():
        company = await factories.company(f"Acme {uuid.uuid4()}", "owner", "owner@example.com")
        found = await transaction(interviews.create, company.id, uuid.uuid4(), "en", 60)
        held = hold_first_commit(monkeypatch, transactions)
        await race(
            os.environ["DATABASE_URL"],
            held,
            transaction(excluded_questions.change, found.id, leaving_out(first)),
            transaction(excluded_questions.change, found.id, leaving_out(second)),
        )

        return (await transaction(interviews.get, found.id)).excluded_questions

    assert run(scenario()) == {topic: [first, second]}
