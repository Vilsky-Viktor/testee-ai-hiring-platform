import pytest
from no_connections import memory_redis, no_real_connections  # noqa: F401
from testee_common.redis import memory_cache

from rounds.integrations import redis as redis_module
from rounds.repositories import session_expiry


@pytest.fixture
def redis_integration():
    return redis_module


@pytest.fixture(autouse=True)
def nothing_expired(monkeypatch):
    """Opening a session checks whether the whole interview ran out of time, in the database;
    unit tests have none, so nothing has expired unless a test says so."""

    async def none_expired(session, now, limit, invite_id=None):
        return []

    monkeypatch.setattr(session_expiry, "expired_invites", none_expired)


@pytest.fixture(autouse=True)
def redis(monkeypatch, memory_redis):  # noqa: F811
    """Each test reads the limits afresh, not a value an earlier test cached."""
    monkeypatch.setattr(memory_cache, "_entries", {})

    return memory_redis
