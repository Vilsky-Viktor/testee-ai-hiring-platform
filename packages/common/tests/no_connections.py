"""What keeps a service's unit tests inside their process: Redis in memory and no connections.
Each service's tests/unit/conftest.py imports both fixtures (each service's pytest `pythonpath`
includes this folder) and names its Redis module:

    from no_connections import memory_redis, no_real_connections  # noqa: F401

    @pytest.fixture
    def redis_integration():
        return <service>.integrations.redis
"""

import socket

import pytest
from fake_redis import FakeRedis


@pytest.fixture(autouse=True)
def no_real_connections(monkeypatch):
    """A unit test reaches nothing outside its process: no Redis, no other service. The in-process
    test client opens no connection, so none is allowed. Code that swallows the error would hide
    it, so the test fails afterwards as well."""
    reached = []

    def refused(target):
        reached.append(target)

        raise RuntimeError(f"Unit tests never connect to {target}")

    monkeypatch.setattr(socket.socket, "connect", lambda sock, address: refused(address))
    monkeypatch.setattr(socket.socket, "connect_ex", lambda sock, address: refused(address))
    monkeypatch.setattr(socket, "getaddrinfo", lambda host, *args, **kwargs: refused(host))

    yield

    if reached:
        pytest.fail(f"The test tried to connect to: {reached}")


@pytest.fixture(autouse=True)
def memory_redis(monkeypatch, redis_integration):
    """Redis in memory wherever get_redis is called, emptied for each test: limits count in it
    and a test edits one in `limits`. A test with a Redis of its own replaces get_redis."""
    fake = FakeRedis()
    monkeypatch.setattr(redis_integration, "redis_client", lambda url: fake)
    redis_integration.get_redis.cache_clear()

    yield fake

    redis_integration.get_redis.cache_clear()
