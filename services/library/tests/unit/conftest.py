import pytest
from no_connections import memory_redis, no_real_connections  # noqa: F401

from library.integrations import redis as redis_module


@pytest.fixture
def redis_integration():
    return redis_module
