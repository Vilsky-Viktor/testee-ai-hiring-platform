import time
import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import update

from notifications.constants.bulk import BulkKind
from notifications.core.db import Session
from notifications.models.bulk import BulkSend
from notifications.repositories import bulk_recipients, bulk_sends
from notifications.services import retention
from tests.integration.transactions import transaction


def test_the_recipients_of_old_finished_sends_go_and_the_send_stays(run):
    old, recent = str(uuid.uuid4()), str(uuid.uuid4())
    user = f"u-{uuid.uuid4()}"
    now = datetime.now(UTC)

    async def started(about, finished_at):
        send_id = await transaction(bulk_sends.start, BulkKind.LEGAL_TERMS, about, "sam")
        await transaction(bulk_sends.save_page, send_id, "", f"x:{user}", [user], True)

        async with Session.begin() as session:
            await session.execute(
                update(BulkSend).where(BulkSend.id == send_id).values(finished_at=finished_at)
            )

    async def scenario():
        await started(old, now - timedelta(days=731))
        await started(recent, now - timedelta(days=729))
        await retention.forget_old(now, time.monotonic() + 30)

        return (
            [send.about for send, _ in await transaction(bulk_recipients.of_user, user)],
            await transaction(bulk_sends.get, BulkKind.LEGAL_TERMS, old),
        )

    kept, send = run(scenario())

    assert kept == [recent]
    assert send is not None
