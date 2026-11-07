from datetime import UTC, datetime
from time import monotonic

from companies.constants.invites import JOB_RUN_SECONDS, ORPHAN_HOLD_AGE
from companies.core.db import Session
from companies.integrations import billing, billing_holds
from companies.repositories import credit_invites


async def release_orphans() -> int:
    """Daily: billing sets a candidate's credits aside before the invite is saved, so an instance
    stopped in between leaves them held with nothing to give them back. Those old enough that no
    invite can still be on its way, with no invite that isn't removed, come back; how many. No
    page starts JOB_RUN_SECONDS into the run: the rest the next day."""
    before = datetime.now(UTC) - ORPHAN_HOLD_AGE
    stop_at = monotonic() + JOB_RUN_SECONDS
    after = ""
    released = 0

    while monotonic() < stop_at:
        keys = await billing_holds.open_holds(before, after)

        if not keys:
            break

        async with Session() as session:
            held = await credit_invites.held_keys(session, keys)

        orphans = [key for key in keys if key not in held]
        await billing.settle_candidates([], orphans)
        released += len(orphans)
        after = keys[-1]

    return released
