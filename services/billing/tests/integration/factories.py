"""Rows the integration tests start from, made as the services make them."""

from billing.repositories import ledger
from billing.services import topups, wallets
from tests.integration.transactions import transaction


async def welcomed(company_id: str, owner_email: str) -> bool:
    """The company's wallet with the welcome credits, once per owner's email (the welcome's
    first step, in a transaction of its own)."""
    return await transaction(wallets.welcome_gift, company_id, owner_email)


async def granted(owner_type: str, owner_id: str, *args, **kwargs) -> bool:
    """A paid top-up (topups.grant) into the owner's wallet, made empty when it has none."""
    await transaction(ledger.ensure, owner_type, owner_id)

    return await topups.grant(owner_type, owner_id, *args, **kwargs)
