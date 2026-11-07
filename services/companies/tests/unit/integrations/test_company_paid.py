"""Whether a company paid sits on nearly every page: a yes is remembered and a read gives up early,
so a slow billing can't fill this service's slots (integrations/billing.py)."""

import asyncio
import uuid

import httpx
import pytest
from fake_redis import DownRedis
from testee_common.http import http
from testee_common.redis import memory_cache

from companies.constants.billing import PAID_KEPT_SECONDS, READ_TIMEOUT_SECONDS
from companies.integrations import billing

# The real call: conftest replaces billing.company_paid for the other tests.
from companies.integrations.billing import company_paid


class Billing:
    def __init__(self, answers):
        self.answers = answers
        self.timeouts = []

    async def get(self, url, headers, timeout):
        self.timeouts.append(timeout)
        answer = self.answers[len(self.timeouts) - 1]

        if isinstance(answer, Exception):
            raise answer

        return httpx.Response(200, json={"paid": answer}, request=httpx.Request("GET", url))


@pytest.fixture
def answering(monkeypatch):
    def install(*answers):
        fake = Billing(answers)
        monkeypatch.setattr(http, "get_client", lambda: fake)
        monkeypatch.setattr(billing, "_headers", dict)

        return fake

    return install


def asked(company_id):
    return asyncio.run(company_paid(company_id))


def test_a_yes_is_remembered_and_read_with_the_short_timeout(answering):
    company_id = uuid.uuid4()
    fake = answering(True)

    assert asked(company_id) is True
    assert asked(company_id) is True
    assert fake.timeouts == [READ_TIMEOUT_SECONDS]


def test_a_first_top_up_shows_on_the_next_read(answering):
    company_id = uuid.uuid4()
    answering(False, True)

    assert asked(company_id) is False
    assert asked(company_id) is True


def test_when_billing_cant_say_it_counts_as_not_and_is_asked_again(answering):
    company_id = uuid.uuid4()
    answering(httpx.ReadTimeout("slow"), True)

    assert asked(company_id) is False
    assert asked(company_id) is True


def test_while_billing_is_down_a_company_that_paid_stays_paid(answering, memory_redis, monkeypatch):
    company_id = uuid.uuid4()
    answering(True, httpx.ReadTimeout("slow"))

    assert asked(company_id) is True

    # Another instance, or this one once its memory ran out.
    monkeypatch.setattr(memory_cache, "_entries", {})

    assert asked(company_id) is True
    assert memory_redis.expiries[f"paid:company:{company_id}"] == PAID_KEPT_SECONDS


def test_with_redis_down_too_it_counts_as_not(answering, monkeypatch):
    answering(httpx.ReadTimeout("slow"))
    monkeypatch.setattr(billing, "get_redis", DownRedis)

    assert asked(uuid.uuid4()) is False
