import logging
import time
from uuid import UUID

from fastapi import HTTPException, status

from ats.constants.ats import ConnectionStatus
from ats.core.db import Session
from ats.models.ats import AtsApplicationChange, AtsConnection
from ats.repositories import ats, ats_applications, ats_links
from ats.services import ats as integrations
from ats.services import ats_candidates as flow
from ats.services import outbox as outbox_service

logger = logging.getLogger(__name__)


async def changed(connection: AtsConnection, application_id: str) -> None:
    """Teamtailor says an application changed: saved, so the web hook is answered at once and
    nothing is lost when Teamtailor can't be read; the ats.application_changed event reads it."""
    async with Session.begin() as session:
        await ats_applications.add(session, connection.id, application_id)

    await outbox_service.flush_quietly()


async def read_changed(data: dict) -> None:
    """ats.application_changed. Teamtailor failing raises, so Pub/Sub delivers the event again;
    a row already read is left, so a redelivery reads nothing."""
    async with Session() as session:
        row = await ats_applications.get(session, UUID(data["ats_application_change_id"]))
        connection = await ats.connection_by_id(session, row.connection_id) if row else None

    if connection is not None:
        await read(row, connection)


async def read(row: AtsApplicationChange, connection: AtsConnection) -> None:
    """The application as Teamtailor has it now: its candidate arrives if it's in a linked job's
    stage. A connection waiting for reconnecting keeps the row, for the recovery job; an
    application deleted in Teamtailor has nothing left to read."""
    if connection.status != ConnectionStatus.CONNECTED:
        return

    try:
        found = await integrations.call(
            connection, "application", application_id=row.application_id
        )
    except HTTPException as error:
        if error.status_code != status.HTTP_404_NOT_FOUND:
            raise

        found = None

    if found:
        async with Session() as session:
            link = await ats_links.link_for_job(session, connection.id, found["job_id"] or "")

        if link and link.stage_id == found["stage_id"] and found["email"]:
            await flow.arrived(
                link, connection, found["candidate_id"], found["email"], found.get("name")
            )

    async with Session.begin() as session:
        await ats_applications.done(session, row)


async def recover(stop_at: float) -> None:
    """For the recovery job, until `stop_at` (time.monotonic): applications still to be read,
    their reads having failed or their connection just reconnected."""
    async with Session() as session:
        rows = await ats_applications.recoverable(session)
        connections = await ats.connections_by_ids(session, {row.connection_id for row in rows})

    for row in rows:
        if time.monotonic() >= stop_at:
            break

        try:
            await read(row, connections[row.connection_id])
        except Exception:
            logger.exception("Couldn't read ATS application change %s", row.id)
