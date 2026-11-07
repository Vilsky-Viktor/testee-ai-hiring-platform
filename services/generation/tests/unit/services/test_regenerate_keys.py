# A replacement's key: what regenerate does when it doesn't hold (test_regenerate.py has the rest).
import asyncio

from generation.integrations import library, llm
from generation.services.regenerate import regenerate
from tests.unit.services import test_regenerate
from tests.unit.services.test_regenerate import QUESTION_ID, FakeLLM, context

fake_embeddings = test_regenerate.fake_embeddings
keys_hold = test_regenerate.keys_hold


def test_a_key_that_doesnt_hold_is_never_saved_and_its_question_never_offered_again(
    monkeypatch, keys_hold
):
    fake = FakeLLM(["How do you cancel an asyncio task?", "What does asyncio.gather return?"])
    keys_hold.add("How do you cancel an asyncio task?")
    saved = []

    async def fake_replace(question_id, question):
        saved.append(question.text)

    monkeypatch.setattr(llm, "get_generation_llm", lambda *_: fake)
    monkeypatch.setattr(library, "replace_question", fake_replace)

    asyncio.run(regenerate(QUESTION_ID, context()))

    assert saved == ["What does asyncio.gather return?"]
    assert "How do you cancel an asyncio task?" in fake.prompts[-2]


def test_no_replacement_when_no_key_holds(monkeypatch, keys_hold):
    fake = FakeLLM([f"How does asyncio handle case {n}?" for n in range(3)])
    keys_hold.update(f"How does asyncio handle case {n}?" for n in range(3))
    saved = []

    async def fake_replace(question_id, question):
        saved.append(question.text)

    monkeypatch.setattr(llm, "get_generation_llm", lambda *_: fake)
    monkeypatch.setattr(library, "replace_question", fake_replace)

    assert asyncio.run(regenerate(QUESTION_ID, context())) is None
    assert saved == []
