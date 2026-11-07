import logging

from testee_common.ai.tracing import tracing_on
from testee_common.events.unhandleable import final

from assistant.core.db import Session
from assistant.integrations import trace_retention
from assistant.repositories import actions, conversations, messages, oauth, update_checks
from assistant.schemas.connect import ConnectionOut

logger = logging.getLogger(__name__)


async def delete_user(user_id: str) -> None:
    """Their conversations go, with every message and tool call, and their connected AI apps
    (whose access stops), in one save; then the actions they hadn't confirmed yet (Redis). Safe
    to repeat."""
    # Their answers' Langfuse traces first: once the messages go, nothing finds them.
    if tracing_on():
        async with Session() as session:
            trace_ids = await conversations.trace_ids_of_user(session, user_id)

        await delete_traces(trace_ids)

    async with Session.begin() as session:
        await conversations.delete_user(session, user_id)
        grants = await oauth.of_user(session, user_id)
        await update_checks.delete_connections(session, [str(grant.id) for grant in grants])
        await oauth.delete_user(session, user_id)

    await actions.delete_user(user_id)


async def delete_traces(trace_ids: list[str]) -> None:
    """A refusal no retry changes doesn't stop the deletion, which would otherwise end with
    nothing deleted: the traces go with the daily job. An outage raises, to be tried again."""
    try:
        await trace_retention.delete_traces(trace_ids)
    except Exception as error:
        if not final(error):
            raise

        logger.exception("Langfuse refused a deleted user's traces: the daily job removes them")


async def export_user(user_id: str) -> dict:
    """Their conversations and messages, and the AI apps they connected."""
    async with Session() as session:
        grants = await oauth.of_user(session, user_id)
        exported = await messages.export(session, user_id)

    return {
        "assistant_conversations": exported,
        "connected_ai_apps": [ConnectionOut.model_validate(grant) for grant in grants],
    }
