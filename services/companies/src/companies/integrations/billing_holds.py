"""What companies reads of the holds billing keeps on candidates' credits."""

from datetime import datetime

from fastapi import status
from testee_common.http import http
from testee_common.http.http import bearer

from companies.config import settings
from companies.constants.billing import READ_TIMEOUT_SECONDS
from companies.core.security import service_token


def _headers() -> dict:
    return bearer(service_token("billing"))


async def candidate_hold(key: str) -> str | None:
    """Whether the credits of the invite with that key are open, charged or released; None
    when none were held."""
    response = await http.get_client().get(
        f"{settings.billing_url}/internal/candidates/hold",
        params={"key": key},
        headers=_headers(),
        timeout=READ_TIMEOUT_SECONDS,
    )

    if response.status_code == status.HTTP_404_NOT_FOUND:
        return None

    response.raise_for_status()

    return response.json()["status"]


async def open_holds(before: datetime, after: str) -> list[str]:
    """A page of the candidates' holds still open that were made before `before`, past `after`."""
    response = await http.get_client().get(
        f"{settings.billing_url}/internal/candidates/holds/open",
        params={"before": before.isoformat(), "after": after},
        headers=_headers(),
    )

    response.raise_for_status()

    return response.json()
