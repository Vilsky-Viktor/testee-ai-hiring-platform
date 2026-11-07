"""No unit test leaves its process (tests/no_connections.py): every service's unit tests take the
shared fixtures, and a test whose code connects anyway fails, even when the code swallows it."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
IMPORT = "from no_connections import memory_redis, no_real_connections"

pytest_plugins = ["pytester"]


def test_every_service_takes_the_shared_fixtures_in_its_unit_tests():
    conftests = [
        path.parent / "tests/unit/conftest.py" for path in ROOT.glob("services/*/pyproject.toml")
    ]
    missing = [
        str(path.relative_to(ROOT))
        for path in conftests
        if not path.exists() or IMPORT not in path.read_text()
    ]

    assert len(conftests) >= 9
    assert missing == []


def test_a_connection_the_code_swallows_still_fails_the_test(pytester):
    pytester.makepyfile(
        """
        import socket

        from no_connections import no_real_connections  # noqa: F401


        def test_connects_quietly():
            try:
                socket.create_connection(("localhost", 6379))
            except RuntimeError:
                pass
        """
    )

    result = pytester.runpytest_inprocess("-p", "no:randomly")

    result.assert_outcomes(passed=1, errors=1)
    result.stdout.fnmatch_lines(["*The test tried to connect to*localhost*"])


def test_redis_is_in_memory_and_empty_for_each_test(pytester):
    pytester.makepyfile(
        f"""
        import asyncio
        from functools import cache
        from types import SimpleNamespace

        import pytest
        {IMPORT}  # noqa: F401

        module = SimpleNamespace(redis_client=None)
        module.get_redis = cache(lambda: module.redis_client("redis://nowhere"))


        @pytest.fixture
        def redis_integration():
            return module


        @pytest.mark.parametrize("attempt", [1, 2])
        def test_starts_empty(attempt):
            redis = module.get_redis()

            assert asyncio.run(redis.get("seen")) is None

            asyncio.run(redis.set("seen", "1"))
        """
    )

    pytester.runpytest_inprocess("-p", "no:randomly").assert_outcomes(passed=2)
