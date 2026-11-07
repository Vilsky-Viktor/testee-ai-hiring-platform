import pytest
from no_connections import memory_redis, no_real_connections  # noqa: F401
from testee_common.redis import memory_cache

from site_content.integrations import redis as redis_module


@pytest.fixture
def redis_integration():
    return redis_module


@pytest.fixture(autouse=True)
def redis(monkeypatch, memory_redis):  # noqa: F811
    """Each test reads the limits afresh, not a value an earlier test cached."""
    monkeypatch.setattr(memory_cache, "_entries", {})

    return memory_redis
