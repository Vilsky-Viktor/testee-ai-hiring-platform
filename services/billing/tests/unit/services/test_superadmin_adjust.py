import asyncio

import pytest
from fastapi import HTTPException

from billing.constants.credits import ADJUSTMENT_BELOW_ZERO, ADJUSTMENT_ZERO
from billing.repositories import ledger
from billing.schemas.billing import AdjustmentIn
from billing.services import wallets

KEY = "4b3f2c1e-58a8-4c3b-9a58-2f0e6e5f7a11"


def adjusted(amount):
    return asyncio.run(wallets.adjust("acme", AdjustmentIn(amount=amount, key=KEY, note="Why")))


def test_an_adjustment_of_nothing_is_refused(monkeypatch):
    moved = []

    async def adjust(*args):
        moved.append(args)

        return True

    monkeypatch.setattr(ledger, "adjust", adjust)

    with pytest.raises(HTTPException) as refused:
        adjusted(0)

    assert (refused.value.status_code, refused.value.detail) == (422, ADJUSTMENT_ZERO)
    assert moved == []


def test_an_adjustment_the_balance_cant_cover_is_refused(monkeypatch):
    async def adjust(*args):
        return False

    monkeypatch.setattr(ledger, "adjust", adjust)

    with pytest.raises(HTTPException) as refused:
        adjusted(-5_000)

    assert (refused.value.status_code, refused.value.detail) == (409, ADJUSTMENT_BELOW_ZERO)
