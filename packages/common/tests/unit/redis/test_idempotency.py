import asyncio

import pytest
from fake_redis import FakeRedis
from redis.exceptions import RedisError
from testee_common.i18n.i18n import CodedError
from testee_common.redis import idempotency
from testee_common.redis.idempotency import fingerprint, key_name, once


class FlakyRedis(FakeRedis):
    """Takes the claim, then fails: keeping the result (`fail_keep`) or freeing a failed run's
    claim (`fail_free`)."""

    def __init__(self, fail_keep=False, fail_free=False):
        super().__init__()
        self.fail_keep = fail_keep
        self.fail_free = fail_free

    async def set(self, name, value, nx=False, ex=None):
        if self.fail_keep and not nx:
            raise RedisError("Redis went away")

        return await super().set(name, value, nx=nx, ex=ex)

    async def delete(self, name):
        if self.fail_free:
            raise RedisError("Redis went away")

        await super().delete(name)


def counting(runs: list[int], result: str = "id-1"):
    async def run() -> str:
        runs.append(1)

        return result

    return run


def test_a_retry_gets_the_first_result_without_running_again_for_its_time():
    redis = FakeRedis()
    runs = []
    request = fingerprint("interview", {"text": "Backend"})

    async def scenario():
        first = await once(redis, "slot", 60, request, counting(runs, "id-1"))
        again = await once(redis, "slot", 60, request, counting(runs, "id-2"))

        return first, again

    assert asyncio.run(scenario()) == ("id-1", "id-1")
    assert runs == [1]
    assert redis.expiries["slot"] == 60


def test_the_same_key_with_another_request_is_refused():
    redis = FakeRedis()

    async def scenario():
        await once(redis, "slot", 60, fingerprint("a"), counting([]))
        await once(redis, "slot", 60, fingerprint("b"), counting([]))

    with pytest.raises(CodedError) as refused:
        asyncio.run(scenario())

    assert (refused.value.status_code, refused.value.code) == (422, "idempotency_key_reused")


def test_a_retry_while_the_first_still_runs_is_refused():
    redis = FakeRedis()
    redis.counts["running"] = f"req:{idempotency.PENDING}".encode()

    with pytest.raises(CodedError) as refused:
        asyncio.run(once(redis, "running", 60, "req", counting([])))

    assert (refused.value.status_code, refused.value.code) == (409, "request_in_progress")


def test_a_result_kept_before_requests_were_fingerprinted_is_still_returned():
    redis = FakeRedis()
    redis.counts["old"] = b"id-0"

    async def run():
        raise AssertionError("ran again")

    assert asyncio.run(once(redis, "old", 60, "any", run)) == "id-0"


def test_a_failed_run_frees_its_key_for_a_retry():
    redis = FakeRedis()
    runs = []

    async def refused():
        raise ValueError("No credits")

    with pytest.raises(ValueError, match="No credits"):
        asyncio.run(once(redis, "slot", 60, "req", refused))

    assert asyncio.run(once(redis, "slot", 60, "req", counting(runs))) == "id-1"
    assert runs == [1]


def test_with_redis_down_it_just_runs():
    runs = []

    assert asyncio.run(once(FakeRedis(down=True), "slot", 60, "req", counting(runs))) == "id-1"
    assert runs == [1]


def test_a_made_result_is_answered_when_redis_fails_to_keep_it():
    redis = FlakyRedis(fail_keep=True)
    runs = []

    assert asyncio.run(once(redis, "slot", 60, "req", counting(runs))) == "id-1"
    assert runs == [1]
    # Still claimed: a retry is told the first one runs, never making it twice.
    assert asyncio.run(redis.get("slot")) == b"req:pending"


def test_a_failed_run_raises_its_own_error_when_redis_fails_to_free_its_claim():
    async def refused():
        raise ValueError("No credits")

    with pytest.raises(ValueError, match="No credits"):
        asyncio.run(once(FlakyRedis(fail_free=True), "slot", 60, "req", refused))


def test_a_client_key_is_kept_hashed_and_per_user():
    name = key_name("rounds", "practice", "ann", "t-1", "secret-key")

    assert name.startswith("rounds:idempotency:practice:ann:t-1:")
    assert "secret-key" not in name
    assert name != key_name("rounds", "practice", "bob", "t-1", "secret-key")
