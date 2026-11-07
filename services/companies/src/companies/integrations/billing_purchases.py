"""What billing knows of top-ups already paid: invoices, and who paid what (support pages)."""

from uuid import UUID

from fastapi import HTTPException, status
from testee_common.http import http

from companies.config import settings
from companies.constants.billing import READ_TIMEOUT_SECONDS
from companies.integrations.billing import _headers


async def company_invoice(company_id: UUID, transaction_id: str) -> str:
    """A temporary link to the invoice of one of the company's top-ups; billing's 404 for any
    other transaction reaches the user unchanged."""
    response = await http.get_client().get(
        f"{settings.billing_url}/internal/companies/{company_id}/invoice",
        params={"transaction_id": transaction_id},
        headers=_headers(),
        timeout=READ_TIMEOUT_SECONDS,
    )

    if response.status_code == status.HTTP_404_NOT_FOUND:
        raise HTTPException(status.HTTP_404_NOT_FOUND, response.json()["detail"])

    response.raise_for_status()

    return response.json()["url"]


async def purchase_owner(transaction_id: str) -> dict | None:
    """Whose wallet a top-up's Paddle transaction paid into (`owner_type`, `owner_id`); None
    when no top-up has it."""
    response = await http.get_client().get(
        f"{settings.billing_url}/internal/purchases/{transaction_id}",
        headers=_headers(),
        timeout=READ_TIMEOUT_SECONDS,
    )

    if response.status_code == status.HTTP_404_NOT_FOUND:
        return None

    response.raise_for_status()

    return response.json()


async def buyer_purchases(user_id: str) -> list[dict]:
    """The company top-ups the user paid for, one per transaction, newest first (at most
    billing's limit): {"transaction_id", "company_id", "total", "currency", "created_at"}."""
    response = await http.get_client().get(
        f"{settings.billing_url}/internal/purchases",
        params={"buyer_id": user_id},
        headers=_headers(),
        timeout=READ_TIMEOUT_SECONDS,
    )

    response.raise_for_status()

    return response.json()
