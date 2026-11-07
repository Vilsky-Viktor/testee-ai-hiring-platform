import time
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import delete, func, select

from notifications.constants.notifications import KEEP_DAYS, MAX_PER_RECIPIENT
from notifications.core.db import Session
from notifications.models.notifications import Notification, Received
from notifications.repositories import notifications
from notifications.services import notices, retention
from tests.integration.factories import company, finished
from tests.integration.transactions import transaction


def expired_at() -> datetime:
    return datetime.now(UTC) - timedelta(days=KEEP_DAYS + 1)


def row(company_id: str, created_at: datetime) -> Notification:
    return Notification(
        event_id=str(uuid.uuid4()),
        recipient="company",
        recipient_id=company_id,
        kind="interview_ready",
        link="/x",
        data={},
        created_at=created_at,
    )


async def store_expired(count: int) -> None:
    """Starts from no expired rows (the database is shared by the run), then adds `count` of
    each table."""
    async with Session() as session:
        await session.execute(delete(Notification).where(Notification.created_at < expired_at()))
        await session.execute(delete(Received).where(Received.received_at < expired_at()))
        session.add_all(row(company(), expired_at()) for _ in range(count))
        session.add_all(
            Received(event_id=str(uuid.uuid4()), received_at=expired_at()) for _ in range(count)
        )
        await session.commit()


async def count_expired() -> tuple[int, int]:
    async with Session() as session:
        rows = await session.scalar(
            select(func.count())
            .select_from(Notification)
            .where(Notification.created_at < expired_at())
        )
        events = await session.scalar(
            select(func.count()).select_from(Received).where(Received.received_at < expired_at())
        )

        return rows, events


def test_the_daily_job_deletes_expired_rows_though_no_new_notification_comes(run):
    async def scenario():
        await store_expired(3)
        kept = company()

        async with Session() as session:
            session.add(row(kept, datetime.now(UTC)))
            await session.commit()

        await retention.forget_notifications(datetime.now(UTC), time.monotonic() + 30)

        async with Session() as session:
            recent = await session.scalar(
                select(func.count())
                .select_from(Notification)
                .where(Notification.recipient_id == kept)
            )

        return await count_expired(), recent

    assert run(scenario()) == ((0, 0), 1)


def test_a_recipient_keeps_only_their_newest(run):
    company_id = company()

    async def scenario():
        now = datetime.now(UTC)

        async with Session() as session:
            session.add_all(
                row(company_id, now - timedelta(minutes=MAX_PER_RECIPIENT - number))
                for number in range(MAX_PER_RECIPIENT)
            )
            await session.commit()

        await notices.store(str(uuid.uuid4()), finished(company_id))
        kept = await transaction(notifications.latest, [("company", company_id)], limit=None)

        return len(kept), kept[0].kind, min(item.created_at for item in kept)

    kept, newest, oldest = run(scenario())

    assert (kept, newest) == (MAX_PER_RECIPIENT, "candidate_finished")
    # The oldest went; the one just after it stayed.
    assert oldest > datetime.now(UTC) - timedelta(minutes=MAX_PER_RECIPIENT)


def test_a_replayed_deletion_leaves_notifications_about_that_address_since(run):
    company_id = company()
    email = f"{uuid.uuid4()}@example.com"

    def about(created_at: datetime) -> Notification:
        found = row(company_id, created_at)
        found.data = {"email": email}

        return found

    async def scenario():
        erased_at = datetime.now(UTC)

        async with Session.begin() as session:
            session.add(about(erased_at - timedelta(hours=1)))
            session.add(about(erased_at + timedelta(hours=1)))

        await transaction(notifications.remove_candidate, email, before=erased_at)

        async with Session() as session:
            left = await session.scalars(
                select(Notification.created_at).where(Notification.recipient_id == company_id)
            )

            return [when > erased_at for when in left]

    assert run(scenario()) == [True]
