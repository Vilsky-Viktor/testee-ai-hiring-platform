import asyncio

from generation.integrations import llm
from generation.prompts.checker import MULTI_ANSWER_KEY
from generation.prompts.confirm import CONFIRM_PROMPT
from generation.schemas.verify import KeyCheck, SelfCheck
from generation.services.key_self_check import (
    NOT_CHECKED,
    OPEN_CONDITION,
    WRONG_KEY,
    key_holds,
    keys_that_hold,
    self_check,
)
from generation.services.nodes.questions import generate_questions
from tests.unit.fakes import FakeVerifier, asked_multi, items


def multi_answer(text="Which entries debit cash?", marked=("Right 1", "Right 2")):
    answers = ["Right 1", "Right 2", "W1", "W2"]

    return {
        "text": text,
        "options": [{"answer": answer, "correct": answer in marked} for answer in answers],
    }


def single_answer(text="Which entry debits cash?"):
    return {
        "text": text,
        "options": [
            {"answer": answer, "correct": answer == "Right"}
            for answer in ("Right", "W1", "W2", "W3")
        ],
    }


def check(monkeypatch, question, verifier):
    monkeypatch.setattr(llm, "get_verifier_llm", lambda: verifier)

    return asyncio.run(self_check(question, "Bookkeeping", "basic"))


def test_a_multi_answer_question_whose_blind_answer_matches_its_key_is_kept(monkeypatch):
    verifier = FakeVerifier()

    assert check(monkeypatch, multi_answer(), verifier) is None
    # The check sees the question's kind, but no option marked.
    assert MULTI_ANSWER_KEY in verifier.prompts[0]
    assert "Which entries debit cash?" in verifier.prompts[0]
    assert "correct" not in verifier.prompts[0].split("<options>")[-1]


def test_a_multi_answer_question_whose_key_doesnt_hold_is_dropped(monkeypatch):
    # The blind answer names both "Right" options; the key marks one of them and a wrong one.
    question = multi_answer(marked=("Right 1", "W1"))

    assert check(monkeypatch, question, FakeVerifier()) == WRONG_KEY


def test_a_blind_answer_of_the_other_kind_drops_the_question(monkeypatch):
    class OneRight(FakeVerifier):
        async def ainvoke(self, messages):
            return SelfCheck(correct_indexes=[0], open_condition=None)

    assert check(monkeypatch, multi_answer(), OneRight()) == WRONG_KEY


def test_a_question_that_leaves_a_deciding_condition_open_is_dropped(monkeypatch):
    verifier = FakeVerifier(open_condition="IFRS or US GAAP")

    assert check(monkeypatch, multi_answer(), verifier) == OPEN_CONDITION


def test_a_question_the_check_fails_on_is_dropped(monkeypatch):
    assert check(monkeypatch, multi_answer(), FakeVerifier(error=True)) == NOT_CHECKED


def test_a_single_answer_question_isnt_checked(monkeypatch):
    verifier = FakeVerifier()

    assert check(monkeypatch, single_answer(), verifier) is None
    assert verifier.prompts == []


def test_only_the_questions_whose_keys_hold_are_kept(monkeypatch):
    monkeypatch.setattr(llm, "get_verifier_llm", FakeVerifier)
    questions = [
        single_answer("Single"),
        multi_answer("Holds"),
        multi_answer("Wrong key", marked=("Right 1", "W2")),
    ]

    kept = asyncio.run(keys_that_hold(questions, "Bookkeeping", "basic"))

    assert [question["text"] for question in kept] == ["Single", "Holds"]


def test_new_questions_are_written_of_both_kinds_and_self_checked(monkeypatch):
    class Writer:
        def __init__(self):
            self.prompts = []

        def with_structured_output(self, schema):
            return self

        async def ainvoke(self, messages):
            self.prompts.append(messages[-1].content)

            return items(["Multi 1", "Multi 2", "Single 1"], multi=2)

    writer = Writer()
    verifier = FakeVerifier()
    monkeypatch.setattr(llm, "get_generation_llm", lambda *_: writer)
    monkeypatch.setattr(llm, "get_verifier_llm", lambda: verifier)
    task = {
        "topic_index": 0,
        "topic": "Bookkeeping",
        "subtopic_index": 0,
        "subtopic": "Cash",
        "count": 3,
        "multi": 2,
        "level": "basic",
    }

    [entry] = asyncio.run(generate_questions(task))["question_pool"]

    assert asked_multi(writer.prompts[0]) == 2
    assert [question["text"] for question in entry["questions"]] == [
        "Multi 1",
        "Multi 2",
        "Single 1",
    ]
    assert [sum(o["correct"] for o in q["options"]) for q in entry["questions"]] == [2, 2, 1]
    # Each multi-answer question was checked; the single-answer one wasn't.
    assert len(verifier.prompts) == 2

    # One that leaves a condition open is dropped.
    monkeypatch.setattr(llm, "get_verifier_llm", lambda: FakeVerifier(open_condition="Which law"))
    [entry] = asyncio.run(generate_questions(task))["question_pool"]

    assert [question["text"] for question in entry["questions"]] == ["Single 1"]


def replacement(monkeypatch, question, verifier):
    monkeypatch.setattr(llm, "get_verifier_llm", lambda: verifier)

    return asyncio.run(key_holds(question["text"], question["options"], "Bookkeeping", "basic"))


def test_a_replacement_gets_the_check_of_a_new_question_of_its_kind(monkeypatch):
    multi, single = FakeVerifier(), FakeVerifier()

    assert replacement(monkeypatch, multi_answer(), multi)
    assert replacement(monkeypatch, single_answer(), single)
    # The multi-answer self-check asks about open conditions; the blind confirmation doesn't.
    assert multi.schemas == [SelfCheck]
    assert single.schemas == [KeyCheck]
    assert CONFIRM_PROMPT.splitlines()[0] in single.prompts[0]


def test_a_replacement_whose_marked_key_isnt_the_one_found_doesnt_hold(monkeypatch):
    marked_wrong = single_answer()
    marked_wrong["options"][0]["correct"] = False
    marked_wrong["options"][1]["correct"] = True

    assert not replacement(monkeypatch, marked_wrong, FakeVerifier())
