import uuid

from sqlalchemy import update

from assistant.core.db import Session
from assistant.helpers.titles import title_seed
from assistant.models.conversations import Message
from assistant.repositories import conversations, messages
from tests.integration.transactions import transaction


def test_an_accounts_answers_and_titles_traces_are_found_to_delete_with_it(run, monkeypatch):
    monkeypatch.setattr(conversations, "new_trace_id", lambda seed: f"trace of {seed}")
    user, other = f"traced-{uuid.uuid4().hex[:8]}", f"other-{uuid.uuid4().hex[:8]}"

    async def scenario():
        mine = None

        for owner, trace in ((user, "a" * 32), (other, "b" * 32)):
            conversation = await transaction(conversations.create, owner, None, "Traced")
            await transaction(messages.add_question, conversation.id, "Hi", "text")

            async with Session() as session:
                await session.execute(
                    update(Message)
                    .where(Message.conversation_id == conversation.id)
                    .values(trace_id=trace)
                )
                await session.commit()

            mine = mine if owner == other else conversation.id

        return mine, await transaction(conversations.trace_ids_of_user, user)

    conversation_id, found = run(scenario())

    assert found == ["a" * 32, f"trace of {title_seed(conversation_id)}"]


def test_a_companys_and_a_candidates_traces_are_found_to_delete_with_them(run, monkeypatch):
    monkeypatch.setattr(conversations, "new_trace_id", lambda seed: None)
    company, other = uuid.uuid4(), uuid.uuid4()
    member = f"member-{uuid.uuid4().hex[:8]}"
    needle = ["ann@example.com"]

    async def traced(company_id, text, trace):
        conversation = await transaction(conversations.create, member, company_id, "Traced")
        await transaction(messages.add_question, conversation.id, text, "text")

        async with Session() as session:
            await session.execute(
                update(Message)
                .where(Message.conversation_id == conversation.id)
                .values(trace_id=trace)
            )
            await session.commit()

    async def scenario():
        await traced(company, "How did ann@example.com do?", "a" * 32)
        await traced(company, "How did bo@example.com do?", "b" * 32)
        await traced(other, "How did ann@example.com do?", "c" * 32)

        return (
            await transaction(conversations.trace_ids_mentioning, company, [], needle),
            await transaction(conversations.trace_ids_of_company, company, []),
        )

    mentioning, of_company = run(scenario())

    assert mentioning == ["a" * 32]
    assert sorted(of_company) == ["a" * 32, "b" * 32]
