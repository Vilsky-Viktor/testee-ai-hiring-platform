import uuid

import httpx
import pytest

from billing.constants.currencies import ChoiceOwner, Currency
from billing.constants.products import OwnerType
from billing.integrations import paddle
from billing.repositories import auto_top_ups as rows
from billing.repositories import currencies
from billing.schemas.billing import AutoTopUpIn
from billing.services import accounts, auto_top_ups
from tests.integration.services.test_auto_top_ups import checkout_data
from tests.integration.transactions import transaction

COMPANY = OwnerType.COMPANY
CHOICE = AutoTopUpIn(product="topup_50", threshold=500, agreed=True)


def running(run, subscription: str) -> tuple[str, str]:
    """A company's automatic top-up, running on Ann's card: (Ann, the company)."""
    ann, acme = f"user-{uuid.uuid4()}", str(uuid.uuid4())

    async def scenario():
        await auto_top_ups.turn_on(COMPANY, acme, CHOICE, ann, Currency.USD)
        await auto_top_ups.start(checkout_data(acme, ann), subscription, "USD")

    run(scenario())

    return ann, acme


def test_turning_off_while_paddle_cant_cancel_keeps_it_to_try_again(run, paddle_calls):
    """The row is what points at the card's subscription: gone first, a failed cancel would
    leave the card charged with nothing left to cancel it by."""
    sub = f"sub_down_{uuid.uuid4().hex[:8]}"
    ann, acme = running(run, sub)

    with pytest.raises(httpx.HTTPStatusError):
        run(auto_top_ups.turn_off(COMPANY, acme))

    with pytest.raises(httpx.HTTPStatusError):
        run(accounts.delete_user(ann))

    assert run(transaction(rows.get, COMPANY, acme)).subscription_id == sub


@pytest.fixture
def paddle_lost_it(monkeypatch):
    """Paddle answers that it has no such subscription, once it's running here."""

    def lose():
        async def subscription_status(subscription_id, timeout=None):
            request = httpx.Request("GET", "https://paddle.test")
            response = httpx.Response(404, request=request)

            raise httpx.HTTPStatusError("no such", request=request, response=response)

        monkeypatch.setattr(paddle, "subscription_status", subscription_status)

    return lose


def test_a_subscription_paddle_no_longer_has_doesnt_stop_a_deletion(
    run, paddle_calls, paddle_lost_it
):
    ann, acme = running(run, f"sub_gone_{uuid.uuid4().hex[:8]}")
    _, globex = running(run, f"sub_gone_{uuid.uuid4().hex[:8]}")
    paddle_lost_it()
    run(transaction(currencies.choose, ChoiceOwner.USER, ann, Currency.EUR))
    run(accounts.delete_user(ann))
    run(accounts.delete_company(globex))

    assert run(transaction(rows.get, COMPANY, acme)) is None
    assert run(transaction(currencies.chosen, ChoiceOwner.USER, ann)) is None
    assert run(transaction(rows.get, COMPANY, globex)) is None


def test_a_refusal_no_retry_changes_doesnt_stop_a_deletion(run, paddle_calls):
    ann, acme = running(run, f"sub_refused_{uuid.uuid4().hex[:8]}")
    _, globex = running(run, f"sub_refused_{uuid.uuid4().hex[:8]}")
    run(accounts.delete_user(ann))
    run(accounts.delete_company(globex))

    assert run(transaction(rows.get, COMPANY, acme)) is None
    assert run(transaction(rows.get, COMPANY, globex)) is None


def test_a_member_turning_it_off_still_hears_a_refusal(run, paddle_calls):
    _, acme = running(run, f"sub_refused_{uuid.uuid4().hex[:8]}")

    with pytest.raises(httpx.HTTPStatusError):
        run(auto_top_ups.turn_off(COMPANY, acme))

    assert run(transaction(rows.get, COMPANY, acme)) is not None


def test_a_subscription_paddle_already_ended_turns_off(run, paddle_calls):
    ann, acme = running(run, f"sub_ended_{uuid.uuid4().hex[:8]}")
    run(accounts.delete_user(ann))

    assert run(transaction(rows.get, COMPANY, acme)) is None
