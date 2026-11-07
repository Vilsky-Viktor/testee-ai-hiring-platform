import asyncio
from contextlib import suppress
from datetime import datetime
from uuid import UUID

import httpx
from fastapi import status
from redis.exceptions import RedisError
from testee_common.http import http
from testee_common.http.backoff import wait_seconds
from testee_common.http.http import bearer, passed_on
from testee_common.i18n import error_codes as shared_codes
from testee_common.i18n.i18n import CodedError
from testee_common.redis import memory_cache

from companies.config import settings
from companies.constants.billing import (
    PAID_CACHE_SECONDS,
    PAID_KEPT_SECONDS,
    READ_TIMEOUT_SECONDS,
    WELCOME_ATTEMPTS,
    WELCOME_FIRST_WAIT_SECONDS,
)
from companies.constants.invites import SETTLE_BATCH
from companies.core.security import service_token
from companies.integrations.redis import get_redis


def _headers() -> dict:
    return bearer(service_token("billing"))


async def hold_candidate(company_id: UUID, key: str) -> None:
    """Sets a candidate's credits aside. Billing's 402 and its message reach the user unchanged."""
    response = await http.get_client().post(
        f"{settings.billing_url}/internal/candidates/hold",
        params={"company_id": str(company_id), "key": key},
        headers=_headers(),
    )

    if response.status_code == status.HTTP_402_PAYMENT_REQUIRED:
        raise CodedError(
            status.HTTP_402_PAYMENT_REQUIRED,
            response.json()["detail"],
            shared_codes.INSUFFICIENT_CREDITS,
        )

    response.raise_for_status()


async def charge_candidate(key: str) -> None:
    response = await http.get_client().post(
        f"{settings.billing_url}/internal/candidates/charge",
        params={"key": key},
        headers=_headers(),
    )

    response.raise_for_status()


async def release_candidate(key: str) -> None:
    response = await http.get_client().post(
        f"{settings.billing_url}/internal/candidates/release",
        params={"key": key},
        headers=_headers(),
    )

    response.raise_for_status()


async def settle_candidates(charge: list[str], release: list[str]) -> None:
    """Candidates' credits taken (`charge`) or given back (`release`), at most SETTLE_BATCH of
    each a call."""
    for start in range(0, max(len(charge), len(release)), SETTLE_BATCH):
        body = {
            "charge": charge[start : start + SETTLE_BATCH],
            "release": release[start : start + SETTLE_BATCH],
        }
        response = await http.get_client().post(
            f"{settings.billing_url}/internal/candidates/settle", json=body, headers=_headers()
        )

        response.raise_for_status()


async def welcome_company(
    company_id: UUID,
    owner_email: str,
    referral: str | None,
    related: list[str],
    country: str | None,
) -> None:
    """The welcome credits come once per owner's email; billing keeps only a hash of it. A
    referral code counts unless it's from one of the owner's other companies (`related`). The
    company pays in the currency of the owner's `country` until changed.
    Billing gives it once per company, so a failed try is repeated: its answer may have been
    lost after the gift was given."""
    for attempt in range(WELCOME_ATTEMPTS):
        try:
            response = await http.get_client().post(
                f"{settings.billing_url}/internal/companies/{company_id}/welcome",
                json={
                    "owner_email": owner_email,
                    "referral": referral,
                    "related": related,
                    "country": country,
                },
                headers=_headers(),
            )
            response.raise_for_status()

            return
        except Exception as error:
            # A refusal (4xx) won't change on a retry; an outage or a lost answer may.
            refused = isinstance(error, httpx.HTTPStatusError) and error.response.is_client_error

            if refused or attempt == WELCOME_ATTEMPTS - 1:
                raise

            await asyncio.sleep(wait_seconds(WELCOME_FIRST_WAIT_SECONDS, attempt))


async def company_referral(company_id: UUID) -> dict:
    """The company's referral code, its reward, and how many it has earned for."""
    response = await http.get_client().get(
        f"{settings.billing_url}/internal/companies/{company_id}/referral",
        headers=_headers(),
        timeout=READ_TIMEOUT_SECONDS,
    )

    response.raise_for_status()

    return response.json()


async def company_paid(company_id: UUID) -> bool:
    """Whether the company ever topped up, which is on nearly every page, so a slow billing can't
    hold them up. Only a yes is kept, as it never changes back and a first top-up shows at once.
    When billing can't say, a yes of the last PAID_KEPT_SECONDS still counts (from Redis, shared
    by the instances), so an outage doesn't hold a paying company to the unpaid limits; with
    none, it counts as not: the company is then held to the daily limit for everyone, rather
    than refused."""
    key = f"paid:company:{company_id}"

    if memory_cache.get(key):
        return True

    try:
        response = await http.get_client().get(
            f"{settings.billing_url}/internal/companies/{company_id}/paid",
            headers=_headers(),
            timeout=READ_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
    except httpx.HTTPError:
        return await paid_before(key)

    paid = response.json()["paid"]

    if paid:
        memory_cache.put(key, True, PAID_CACHE_SECONDS)

        with suppress(RedisError):
            await get_redis().set(key, "1", ex=PAID_KEPT_SECONDS)

    return paid


async def paid_before(key: str) -> bool:
    try:
        return await get_redis().exists(key) > 0
    except RedisError:
        return False


async def company_credits(company_id: UUID) -> dict:
    """The company's available credits, and whether they're running low."""
    response = await http.get_client().get(
        f"{settings.billing_url}/internal/companies/{company_id}/credits",
        headers=_headers(),
        timeout=READ_TIMEOUT_SECONDS,
    )

    response.raise_for_status()

    return response.json()


async def delete_company(company_id: UUID) -> None:
    """The company's wallet and history; safe to repeat."""
    response = await http.get_client().delete(
        f"{settings.billing_url}/internal/companies/{company_id}",
        headers=_headers(),
    )

    response.raise_for_status()


async def companies_credits(company_ids: list[UUID]) -> dict[str, dict]:
    """Each company's balance, by id."""
    response = await http.get_client().post(
        f"{settings.billing_url}/internal/companies/credits",
        json={"owner_ids": [str(company_id) for company_id in company_ids]},
        headers=_headers(),
    )

    response.raise_for_status()

    return response.json()


async def company_history(
    company_id: UUID,
    offset: int,
    limit: int,
    kind: str | None = None,
    start: datetime | None = None,
    end: datetime | None = None,
) -> list[dict]:
    """A page of the company's credit movements, newest first, or only those of one `kind`, from
    `start` and before `end`."""
    params: dict = {"offset": offset, "limit": limit}

    if kind:
        params["kind"] = kind

    if start:
        params["start"] = start.isoformat()

    if end:
        params["end"] = end.isoformat()

    response = await http.get_client().get(
        f"{settings.billing_url}/internal/companies/{company_id}/history",
        params=params,
        headers=_headers(),
        timeout=READ_TIMEOUT_SECONDS,
    )

    response.raise_for_status()

    return response.json()


async def company_spent(company_id: UUID) -> int:
    """The credits the company's candidates took this calendar month."""
    response = await http.get_client().get(
        f"{settings.billing_url}/internal/companies/{company_id}/spent",
        headers=_headers(),
        timeout=READ_TIMEOUT_SECONDS,
    )

    response.raise_for_status()

    return response.json()["credits"]


async def turn_off_auto_top_up(company_id: UUID, buyer_id: str | None = None) -> None:
    """The company's automatic top-up goes off (a member removed or made a viewer, the company
    deleted); with `buyer_id`, only when that person's card pays for it."""
    params = {"buyer_id": buyer_id} if buyer_id else None
    response = await http.get_client().delete(
        f"{settings.billing_url}/internal/companies/{company_id}/auto-top-up",
        params=params,
        headers=_headers(),
    )

    response.raise_for_status()


async def adjust_company(company_id: UUID, amount: int, note: str, key: UUID) -> None:
    """A superadmin's adjustment of the company's credits, once per key. Billing's refusals
    reach the superadmin unchanged: one that would take the available balance below zero (409),
    or an amount of zero (422)."""
    response = await http.get_client().post(
        f"{settings.billing_url}/internal/companies/{company_id}/adjustments",
        json={"amount": amount, "note": note, "key": str(key)},
        headers=_headers(),
    )

    passed_on(response, {status.HTTP_409_CONFLICT, status.HTTP_422_UNPROCESSABLE_CONTENT})
