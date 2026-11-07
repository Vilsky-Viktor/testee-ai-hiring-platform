import hashlib
from collections.abc import Awaitable, Callable
from uuid import UUID

from testee_common.redis.idempotency import Made, fingerprint, key_name, once_or_found

from api.constants.api import IDEMPOTENCY_SECONDS, RETRY_WINDOW_SECONDS
from api.integrations.redis import get_redis


def slot(company_id: UUID, key_id: UUID, client_key: str | None, request: str) -> tuple[str, int]:
    """Where a create's first result is kept (testee_common.redis.idempotency.once), and for
    how long. With the client's `Idempotency-Key` (still taken from integrations that send one):
    that key, a day. Without one, derived here from the API key and the request itself, for
    RETRY_WINDOW_SECONDS: a network retry gets the first result, while the same request made on
    purpose later creates again. Clients never need to send a key."""
    if client_key:
        digest = hashlib.sha256(client_key.encode()).hexdigest()

        return f"api:idempotency:{company_id}:{digest}", IDEMPOTENCY_SECONDS

    return f"api:idempotency:derived:{key_id}:{request}", RETRY_WINDOW_SECONDS


async def once_per_key[T: Made](
    what: str,
    user_id: str,
    company_id: UUID,
    key: str | None,
    body: dict,
    make: Callable[[], Awaitable[T]],
    find: Callable[[UUID], Awaitable[T]],
) -> T:
    """`make` once per the user's Idempotency-Key in the company, for the company's API page and
    the assistant: a retry gets what the first made back (`find`). Without a key, it just makes."""
    if key is None:
        return await make()

    name = key_name("api", what, user_id, company_id, key)
    request = fingerprint(what, company_id, body)

    return await once_or_found(get_redis(), name, IDEMPOTENCY_SECONDS, request, make, find)
