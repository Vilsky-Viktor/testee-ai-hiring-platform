import json

from assistant.constants.mcp import (
    CODE_KEY,
    CODE_SECONDS,
    REQUEST_KEY,
    REQUEST_SECONDS,
    USED_CODE_KEY,
)
from assistant.integrations.redis import get_redis


async def save_request(request_id: str, request: dict) -> None:
    """An app's request to connect, waiting for the user to allow or deny it."""
    await get_redis().set(
        REQUEST_KEY.format(request_id=request_id), json.dumps(request), ex=REQUEST_SECONDS
    )


async def peek_request(request_id: str) -> dict | None:
    found = await get_redis().get(REQUEST_KEY.format(request_id=request_id))

    return json.loads(found) if found else None


async def take_request(request_id: str) -> dict | None:
    """Takes the request, atomically: of two answers to it, only one gets it."""
    found = await get_redis().getdel(REQUEST_KEY.format(request_id=request_id))

    return json.loads(found) if found else None


async def save_code(code_hash: str, code: dict) -> None:
    """A code the user's allowing gave the app, until it exchanges it (once) for tokens."""
    await get_redis().set(CODE_KEY.format(code_hash=code_hash), json.dumps(code), ex=CODE_SECONDS)


async def peek_code(code_hash: str) -> dict | None:
    found = await get_redis().get(CODE_KEY.format(code_hash=code_hash))

    return json.loads(found) if found else None


async def take_code(code_hash: str) -> dict | None:
    """Takes the code, atomically: it's exchanged at most once."""
    found = await get_redis().getdel(CODE_KEY.format(code_hash=code_hash))

    return json.loads(found) if found else None


async def save_used_code(code_hash: str, grant_id: str) -> None:
    """Remembers the connection an exchanged code made, in case the code comes again."""
    await get_redis().set(USED_CODE_KEY.format(code_hash=code_hash), grant_id, ex=CODE_SECONDS)


async def take_used_code(code_hash: str) -> str | None:
    """The connection a code already exchanged made, if it's that code."""
    found = await get_redis().getdel(USED_CODE_KEY.format(code_hash=code_hash))

    return found.decode() if found else None
