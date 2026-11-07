from fastapi import APIRouter, HTTPException, Request, status
from testee_common.http.client_ip import limit_address
from testee_common.limits.rate_limit import hit_or_skip

from notifications.config import settings
from notifications.helpers.unsubscribe import verify
from notifications.integrations.redis import get_redis
from notifications.schemas.unsubscribe import UnsubscribeOut
from notifications.services.unsubscribe import apply

router = APIRouter(prefix="/unsubscribe", tags=["unsubscribe"])


def checked(token: str) -> dict:
    payload = verify(token, settings.email_link_secret)

    if payload is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Link not found")

    return payload


@router.get("/{token}")
async def describe(token: str) -> UnsubscribeOut:
    """What an email's unsubscribe link stops; no sign-in. Reading it changes nothing, as mail
    scanners open links."""
    payload = checked(token)

    return UnsubscribeOut(type=payload["type"], company=payload.get("company"))


@router.post("/{token}", status_code=status.HTTP_204_NO_CONTENT)
async def unsubscribe(token: str, request: Request) -> None:
    """Applies the link; no sign-in. The unsubscribe page's button posts here, and so do mail
    clients' own unsubscribe buttons (RFC 8058: `List-Unsubscribe=One-Click` as the body, which
    needs nothing more). Safe to repeat. Counted by address once the link is checked, as applying
    it calls accounts; with Redis down, not counted."""
    payload = checked(token)
    key = f"rate:unsubscribes:{limit_address(request)}"
    await hit_or_skip(get_redis(), key, "UNSUBSCRIBE_PER_IP_MINUTE")
    await apply(payload)
