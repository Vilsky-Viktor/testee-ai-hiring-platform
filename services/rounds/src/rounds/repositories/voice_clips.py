import uuid
from datetime import datetime

from sqlalchemy import select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from testee_common.db.db import delete_in_batches

from rounds.constants.voice import CLIP_DELETE_BATCH
from rounds.models.voice_clips import VoiceClip


async def get(session: AsyncSession, key: str) -> VoiceClip | None:
    return await session.scalar(select(VoiceClip).where(VoiceClip.key == key))


async def kept(session: AsyncSession, keys: list[str]) -> list:
    """Which of the clips are kept, and since when unused, without loading their audio."""
    query = select(VoiceClip.id, VoiceClip.key, VoiceClip.used_at).where(VoiceClip.key.in_(keys))

    return list((await session.execute(query)).all())


async def add(session: AsyncSession, clip: VoiceClip) -> VoiceClip:
    """Saves a new clip; when another request read the same text first, theirs is kept and
    returned (the key is unique)."""
    values = {
        "id": clip.id or uuid.uuid4(),
        "key": clip.key,
        "company_id": clip.company_id,
        "audio": clip.audio,
        "seconds": clip.seconds,
    }
    await session.execute(
        insert(VoiceClip).values(values).on_conflict_do_nothing(index_elements=["key"])
    )

    return await get(session, clip.key)


async def touch(session: AsyncSession, clip_ids: list[uuid.UUID], now: datetime) -> None:
    await session.execute(update(VoiceClip).where(VoiceClip.id.in_(clip_ids)).values(used_at=now))


async def remove_for_company(sessions, company_id: uuid.UUID) -> int:
    """A deleted company's clips, a batch at a time."""
    return await delete_in_batches(
        sessions, VoiceClip, VoiceClip.company_id == company_id, batch=CLIP_DELETE_BATCH
    )


async def remove_unused(sessions, before: datetime, until: float | None = None) -> int:
    """Clips nobody has played since `before`, a batch at a time, starting none after `until`."""
    return await delete_in_batches(
        sessions, VoiceClip, VoiceClip.used_at < before, batch=CLIP_DELETE_BATCH, until=until
    )
