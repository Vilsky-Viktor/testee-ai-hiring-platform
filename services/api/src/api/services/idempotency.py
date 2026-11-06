import hashlib
from uuid import UUID

from api.constants.api import IDEMPOTENCY_SECONDS, RETRY_WINDOW_SECONDS


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
