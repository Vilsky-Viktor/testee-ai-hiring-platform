"""A user's data in the assistant, against the real database: the export names the tools each
answer used (never their data), and deleting the account also deletes when its AI app
connections last asked for updates, leaving another user's untouched."""

import uuid
from datetime import UTC, datetime

import httpx
import pytest

from assistant.constants.chat import Role, Source
from assistant.core.db import Session
from assistant.integrations import trace_retention
from assistant.models.conversations import Message, ToolCall
from assistant.repositories import conversations, messages, oauth, update_checks
from assistant.services import accounts
from tests.integration.repositories.test_connected_apps import connect
from tests.integration.transactions import transaction


async def answered_with_a_tool(user_id: str) -> None:
    async with Session.begin() as session:
        conversation = await conversations.create(session, user_id, None, "Candidates")
        await messages.add_question(session, conversation.id, "Who finished?", Source.TEXT)
        answer = Message(conversation_id=conversation.id, role=Role.ASSISTANT, content="Ann.")
        session.add(answer)
        await session.flush()
        session.add(
            ToolCall(
                message_id=answer.id,
                tool="list_candidates",
                arguments=["interview_id"],
                status_code=200,
                duration_ms=40,
            )
        )


async def checked_updates(user_id: str) -> list[str]:
    """Each of the user's connections asks for updates once; their ids."""
    async with Session() as session:
        grants = await oauth.of_user(session, user_id)

    ids = [str(grant.id) for grant in grants]

    for connection_id in ids:
        await transaction(update_checks.save, connection_id, datetime.now(UTC))

    return ids


def test_the_export_names_the_tools_and_deletion_takes_the_update_checks(run):
    user, other = f"data-{uuid.uuid4().hex[:8]}", f"data-{uuid.uuid4().hex[:8]}"

    async def scenario():
        await answered_with_a_tool(user)
        await connect(user, "Claude")
        await connect(other, "Claude")
        [mine], [theirs] = await checked_updates(user), await checked_updates(other)
        exported = await accounts.export_user(user)

        # Accounts' event, delivered twice: the second finds nothing left.
        for _ in range(2):
            await accounts.delete_user(user)

        left = (
            await transaction(update_checks.last, mine),
            await transaction(update_checks.last, theirs),
        )
        await accounts.delete_user(other)

        return exported, left

    exported, (mine, theirs) = run(scenario())

    [conversation] = exported["assistant_conversations"]
    question, answer = conversation["messages"]
    assert question["tools"] == []
    assert answer["tools"] == [
        {"tool": "list_candidates", "arguments": ["interview_id"], "state": "done"}
    ]
    assert (mine, theirs is not None) == (None, True)


def refusing_traces(monkeypatch, status):
    async def delete_traces(trace_ids):
        request = httpx.Request("DELETE", "https://langfuse.test")
        response = httpx.Response(status, request=request)

        raise httpx.HTTPStatusError("refused", request=request, response=response)

    monkeypatch.setattr(accounts, "tracing_on", lambda: True)
    monkeypatch.setattr(trace_retention, "delete_traces", delete_traces)


def test_langfuse_refusing_for_good_doesnt_stop_the_deletion(run, monkeypatch):
    user = f"data-{uuid.uuid4().hex[:8]}"
    refusing_traces(monkeypatch, 404)

    async def scenario():
        await answered_with_a_tool(user)
        await accounts.delete_user(user)

        async with Session() as session:
            return await messages.export(session, user)

    assert run(scenario()) == []


def test_a_langfuse_outage_raises_with_the_conversations_kept(run, monkeypatch):
    user = f"data-{uuid.uuid4().hex[:8]}"
    refusing_traces(monkeypatch, 503)

    async def scenario():
        await answered_with_a_tool(user)

        with pytest.raises(httpx.HTTPStatusError):
            await accounts.delete_user(user)

        async with Session() as session:
            return await messages.export(session, user)

    assert run(scenario()) != []
