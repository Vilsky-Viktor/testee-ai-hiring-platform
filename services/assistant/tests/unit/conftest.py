import httpx
import pytest
from no_connections import memory_redis, no_real_connections  # noqa: F401

from assistant.constants.tool_groups import ToolGroup
from assistant.integrations import llm, services
from assistant.integrations import redis as redis_module
from assistant.services import actions
from tests.fake_model import FakeRoutingModel
from tests.unit.actions_setup import COMPANY
from tests.unit.help_setup import help_redis, knowledge  # noqa: F401


class Writes(list):
    """The services' writes; each answers `status`, with `body` when set. `referrals`: the
    referral code each carried."""

    status = 201
    body: dict | None = None

    def __init__(self):
        super().__init__()
        self.referrals = []


@pytest.fixture
def redis_integration():
    return redis_module


@pytest.fixture
def redis(monkeypatch, memory_redis):  # noqa: F811
    async def nothing(*args, **kwargs):
        pass

    async def owned(conversation_id, user_id, token, language):
        return None

    async def companies(user_id, fresh=False):
        return frozenset({COMPANY})

    monkeypatch.setattr(actions, "refuse_if_paused", nothing)
    monkeypatch.setattr(actions, "hit", nothing)
    monkeypatch.setattr(actions.limits, "check", nothing)
    monkeypatch.setattr(actions, "open_conversation", owned)
    monkeypatch.setattr(actions, "user_companies", companies)

    return memory_redis


@pytest.fixture
def writes(monkeypatch):
    """The services' writes, answering 201 with a new company."""
    made = Writes()

    async def send(
        service,
        method,
        path,
        query,
        body,
        token,
        language,
        idempotency_key=None,
        via=None,
        referral=None,
    ):
        made.append((service, method, path, body, token, idempotency_key))
        made.referrals.append(referral)
        request = httpx.Request(method, f"http://{service}{path}")

        if made.status is None:
            raise httpx.ReadTimeout("no answer", request=request)

        return httpx.Response(
            made.status,
            json=made.body or {"id": COMPANY, "name": body["name"], "role": "owner"},
            request=request,
        )

    monkeypatch.setattr(services, "send", send)

    return made


@pytest.fixture(autouse=True)
def users_companies(monkeypatch):
    """Companies' list of the user's companies, faked: COMPANY, unless a test says otherwise;
    nothing is kept between tests."""
    from testee_common.redis import memory_cache

    from assistant.integrations import companies

    async def company_ids(user_id):
        return [COMPANY]

    monkeypatch.setattr(companies, "company_ids", company_ids)
    monkeypatch.setattr(memory_cache, "_entries", {})


@pytest.fixture(autouse=True)
def routing(monkeypatch):
    """The routing call, faked to pick every group (every tool offered, no OpenAI); a test
    sets `groups` or `error` to check routing itself."""
    fake = FakeRoutingModel(list(ToolGroup))
    monkeypatch.setattr(llm, "get_routing_model", lambda: fake)

    return fake
