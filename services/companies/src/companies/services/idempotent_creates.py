from collections.abc import Awaitable, Callable
from uuid import UUID

from testee_common.redis.idempotency import Made, fingerprint, key_name, once_or_found

from companies.constants.idempotency import IDEMPOTENCY_SECONDS
from companies.integrations.redis import get_redis


async def once_per_key[T: Made](
    what: str,
    user_id: str,
    scope: object,
    key: str | None,
    body: dict,
    make: Callable[[], Awaitable[T]],
    find: Callable[[UUID], Awaitable[T]],
) -> T:
    """`make` once per user's `key` (with what it's for, `scope`, and its `body`): a retry gets
    what the first made back (`find`), one while the first runs is refused (409), the key with
    another request too (422). Without a key, it just makes. The key is the user's alone: their
    id is in its name, and the client's key is hashed."""
    if key is None:
        return await make()

    name = key_name("companies", what, user_id, scope, key)
    request = fingerprint(what, scope, body)

    return await once_or_found(get_redis(), name, IDEMPOTENCY_SECONDS, request, make, find)
