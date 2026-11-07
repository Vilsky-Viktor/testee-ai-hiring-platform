"""The deleted accounts kept for a restore: once per account, and forgotten after their time."""

import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from testee_common.events.deletions import USER_DELETED

from accounts.core.db import Session
from accounts.models.outbox import OutboxEvent
from accounts.repositories import erasures, outbox
from tests.integration.transactions import transaction


def test_an_erasure_is_kept_once_and_forgotten_after_its_time(run):
    user_id = f"gone-{uuid.uuid4()}"

    async def scenario():
        await transaction(erasures.record, user_id, "gone@example.com")
        await transaction(erasures.record, user_id, "gone@example.com")
        hour_ago = datetime.now(UTC) - timedelta(hours=1)
        kept = [item.user_id for item in await transaction(erasures.page, hour_ago, None, 1000)]
        await erasures.forget(Session, datetime.now(UTC) + timedelta(seconds=1))

        return kept, [
            item.user_id for item in await transaction(erasures.page, hour_ago, None, 1000)
        ]

    kept, after = run(scenario())

    assert kept.count(user_id) == 1
    assert user_id not in after


def test_erasures_are_read_newest_first_a_page_at_a_time(run):
    marker = uuid.uuid4()
    users = [f"gone-{marker}-{index}" for index in range(3)]

    async def scenario():
        for user_id in users:
            await transaction(erasures.record, user_id, "gone@example.com")

        hour_ago = datetime.now(UTC) - timedelta(hours=1)
        pages, below = [], None

        while True:
            page = await transaction(erasures.page, hour_ago, below, 2)
            pages.append([item.user_id for item in page])

            if len(page) < 2:
                return pages

            below = (page[-1].erased_at, page[-1].user_id)

    pages = run(scenario())
    seen = [user_id for page in pages for user_id in page]

    # Other tests' erasures may be among them: ours come once each, the latest first.
    assert [user_id for user_id in seen if user_id in users] == users[::-1]
    assert all(len(page) <= 2 for page in pages)


def test_a_replay_drops_the_deletion_events_published_or_long_unpublished(run):
    """Each holds an email, which then lasts no longer than the erasure note; a fresh event still
    to be published stays, and so does any other kind."""
    published, late, fresh, other = [str(uuid.uuid4()) for _ in range(4)]

    async def scenario():
        now = datetime.now(UTC)
        rows = [
            (published, USER_DELETED, now, now),
            (late, USER_DELETED, None, now - timedelta(days=1)),
            (fresh, USER_DELETED, None, now),
            (other, "email.preferences_changed", now, now),
        ]

        async with Session.begin() as session:
            for user_id, kind, sent, made in rows:
                session.add(
                    OutboxEvent(
                        id=uuid.uuid4(),
                        event_type=kind,
                        data={"user_id": user_id},
                        published_at=sent,
                        created_at=made,
                    )
                )

        await outbox.forget_deletions(Session)

        async with Session() as session:
            left = await session.scalars(
                select(OutboxEvent.data["user_id"].astext).where(
                    OutboxEvent.data["user_id"].astext.in_([published, late, fresh, other])
                )
            )

            return set(left)

    assert run(scenario()) == {fresh, other}
