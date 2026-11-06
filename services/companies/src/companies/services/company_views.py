"""The user's companies as the site lists them."""

from datetime import UTC, datetime
from uuid import UUID

import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from companies.constants.company_status import FINISHED_WINDOW
from companies.constants.roles import EDITORS, Role
from companies.core.db import Session
from companies.helpers.company_status import company_status
from companies.integrations import billing
from companies.models.companies import Company
from companies.repositories import companies, interviews
from companies.schemas.companies import CompanyOut
from companies.services.access import key_company


async def user_companies(
    session: AsyncSession,
    user_id: str,
    offset: int,
    limit: int,
    roles: tuple[str, ...] = tuple(Role),
    q: str = "",
) -> list[Company]:
    """The user's companies (only where their role is one of `roles`, and with `q` in their
    name); for an AI agent signed in with an API key, the key's own, as an admin's."""
    keyed = key_company(user_id)

    if keyed is not None:
        found = await companies.get(session, UUID(keyed))

        return [found] if found is not None and offset == 0 else []

    return await companies.list_for_user(session, user_id, offset, limit, roles, q)


async def _balances(company_ids: list[UUID]) -> dict[str, dict]:
    """Each company's balance; none when billing doesn't answer: the list shows without them."""
    if not company_ids:
        return {}

    try:
        return await billing.companies_credits(company_ids)
    except httpx.HTTPError:
        return {}


async def listed(
    user_id: str, offset: int, limit: int, q: str = ""
) -> list[tuple[Company, int, dict | None, int]]:
    """The user's companies, each with its number of interviews, balance and candidates who
    finished lately; for an AI agent signed in with an API key, the key's only."""
    since = datetime.now(UTC) - FINISHED_WINDOW

    async with Session() as session:
        rows = await user_companies(session, user_id, offset, limit, q=q)
        ids = [item.id for item in rows]
        totals = await interviews.counts(session, ids)
        finished = await interviews.finished_since(session, ids, since)

    balances = await _balances(ids)

    return [
        (item, totals.get(item.id, 0), balances.get(str(item.id)), finished.get(item.id, 0))
        for item in rows
    ]


def with_summary(out: CompanyOut, balance: dict | None, finished: int) -> CompanyOut:
    """A company as the list shows it: its credits, and the one thing to know about it now."""
    low = balance is not None and balance["low"]
    status = company_status(out.can_edit, low, out.verification_status, finished)

    return out.model_copy(
        update={
            "credits": balance["available"] if balance else None,
            "status": status,
            "finished_count": finished,
        }
    )


async def with_credits(user_id: str, offset: int, limit: int) -> list[tuple[Company, dict]]:
    """The companies the user may top up, as an owner or admin, each with its credits."""
    async with Session() as session:
        rows = await user_companies(session, user_id, offset, limit, EDITORS)

    credits = await billing.companies_credits([item.id for item in rows]) if rows else {}

    return [(item, credits[str(item.id)]) for item in rows]


async def referral(company_id) -> dict:
    """The company's referral code and rewards, each reward with its company's name."""
    found = await billing.company_referral(company_id)

    async with Session() as session:
        names = await companies.names(session, [row["company_id"] for row in found["rewards"]])

    return {**found, "names": names}
