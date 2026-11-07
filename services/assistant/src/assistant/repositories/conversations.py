from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy import Text, and_, cast, delete, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from testee_common.ai.tracing import new_trace_id
from testee_common.db.db import delete_in_batches

from assistant.helpers.titles import title_seed
from assistant.models.conversations import Conversation, Message


async def create(
    session: AsyncSession, user_id: str, company_id: UUID | None, title: str
) -> Conversation:
    conversation = Conversation(user_id=user_id, company_id=company_id, title=title)
    session.add(conversation)
    await session.flush()

    return conversation


async def owned(session: AsyncSession, conversation_id: UUID, user_id: str) -> Conversation | None:
    """The user's own conversation; None when it's gone or someone else's."""
    return await session.scalar(
        select(Conversation).where(
            Conversation.id == conversation_id, Conversation.user_id == user_id
        )
    )


async def of_user(
    session: AsyncSession, user_id: str, company_id: UUID | None, offset: int, limit: int
) -> list[Conversation]:
    """The user's conversations, the latest first; about one company when it's given."""
    query = select(Conversation).where(Conversation.user_id == user_id)

    if company_id is not None:
        query = query.where(Conversation.company_id == company_id)

    query = query.order_by(Conversation.updated_at.desc(), Conversation.id)

    return list(await session.scalars(query.offset(offset).limit(limit)))


async def delete_one(session: AsyncSession, conversation_id: UUID) -> None:
    """With its messages and their tool calls (the foreign keys cascade)."""
    await session.execute(delete(Conversation).where(Conversation.id == conversation_id))


async def delete_idle(session: AsyncSession, before: datetime, limit: int) -> int:
    """Up to `limit` conversations nobody added to since `before`; how many went."""
    idle = (
        select(Conversation.id).where(Conversation.updated_at < before).limit(limit)
    ).scalar_subquery()

    result = await session.execute(delete(Conversation).where(Conversation.id.in_(idle)))

    return result.rowcount


async def delete_company(
    sessions: async_sessionmaker, company_id: UUID, member_ids: list[str]
) -> int:
    """Every conversation about the company, and its members' about all their companies (any can
    hold its data), with their messages, a batch at a time (each its own transaction); how many
    went (none when run again)."""
    return await delete_in_batches(sessions, Conversation, _of_company(company_id, member_ids))


def _of_company(company_id: UUID, member_ids: list[str]):
    of_members = and_(Conversation.company_id.is_(None), Conversation.user_id.in_(member_ids))

    return or_(Conversation.company_id == company_id, of_members)


def mentions(text, needle: str):
    return func.strpos(func.lower(text), needle.lower()) > 0


async def delete_mentioning(
    sessions: async_sessionmaker, company_id: UUID, member_ids: list[str], needles: list[str]
) -> int:
    """The conversations about the company, and any of its members' (they can read the company
    from a chat about all their companies, or one started about another), whose messages mention
    any of `needles` (an erased candidate's email or invite, a deleted interview): they go whole,
    as what's left of one would still read as about that person. A batch at a time; how many
    went (none when run again)."""
    return await delete_in_batches(
        sessions, Conversation, *_mentioning(company_id, member_ids, needles)
    )


def _mentioning(company_id: UUID, member_ids: list[str], needles: list[str]) -> tuple:
    # Only the company's and its members' messages are read, never every tenant's.
    about = or_(Conversation.company_id == company_id, Conversation.user_id.in_(member_ids))
    said = select(Message.conversation_id).where(
        Message.conversation_id.in_(select(Conversation.id).where(about)),
        or_(
            *(mentions(Message.content, needle) for needle in needles),
            *(mentions(cast(Message.blocks, Text), needle) for needle in needles),
        ),
    )

    return about, Conversation.id.in_(said)


async def _trace_ids(session: AsyncSession, *where) -> list[str]:
    """The Langfuse traces of these conversations: their answers' and their titles'. Once the
    rows go, nothing finds them."""
    answers = await session.scalars(
        select(Message.trace_id)
        .join(Conversation, Conversation.id == Message.conversation_id)
        .where(*where, Message.trace_id.is_not(None))
    )
    ids = await session.scalars(select(Conversation.id).where(*where))
    titles = [new_trace_id(title_seed(conversation_id)) for conversation_id in ids]

    return [*answers, *filter(None, titles)]


async def trace_ids_of_user(session: AsyncSession, user_id: str) -> list[str]:
    return await _trace_ids(session, Conversation.user_id == user_id)


async def trace_ids_of_company(
    session: AsyncSession, company_id: UUID, member_ids: list[str]
) -> list[str]:
    return await _trace_ids(session, _of_company(company_id, member_ids))


async def trace_ids_mentioning(
    session: AsyncSession, company_id: UUID, member_ids: list[str], needles: list[str]
) -> list[str]:
    return await _trace_ids(session, *_mentioning(company_id, member_ids, needles))


async def delete_user(session: AsyncSession, user_id: str) -> None:
    await session.execute(delete(Conversation).where(Conversation.user_id == user_id))


async def set_title(session: AsyncSession, conversation_id: UUID, title: str) -> None:
    await session.execute(
        update(Conversation).where(Conversation.id == conversation_id).values(title=title)
    )


async def latest(session: AsyncSession, user_id: str, minutes: int) -> Conversation | None:
    """The user's conversation with the latest message, if that's at most `minutes` old."""
    since = datetime.now(UTC) - timedelta(minutes=minutes)

    return await session.scalar(
        select(Conversation)
        .where(Conversation.user_id == user_id, Conversation.updated_at >= since)
        .order_by(Conversation.updated_at.desc())
        .limit(1)
    )
