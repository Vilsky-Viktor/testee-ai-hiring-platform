import logging
import time

from fastapi import APIRouter, HTTPException, Request, status
from testee_common.config.constants import WEBHOOK_SIGNATURE_REFUSED
from testee_common.http.client_ip import limit_address
from testee_common.limits.rate_limit import hit_or_skip

from notifications.config import settings
from notifications.constants.webhooks import WEBHOOK_TOLERANCE_SECONDS
from notifications.helpers.webhooks import kept_of, signature_valid
from notifications.integrations.redis import get_redis
from notifications.services import webhooks

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/resend", status_code=status.HTTP_204_NO_CONTENT)
async def resend_webhook(request: Request) -> None:
    """Answered once the signature is checked and the event recorded (by its delivery id, so a
    repeat is recorded once): its work runs from the email.webhook_received event
    (services/webhooks.py), retried by Pub/Sub, not before the answer. Counted by sending address before the signature is
    checked; with Redis down, not counted."""
    key = f"rate:resend-webhooks:{limit_address(request)}"
    await hit_or_skip(get_redis(), key, "RESEND_WEBHOOKS_PER_IP_MINUTE")
    body = await request.body()

    if not signature_valid(
        request.headers.get("svix-id", ""),
        request.headers.get("svix-timestamp", ""),
        request.headers.get("svix-signature", ""),
        body,
        settings.resend_webhook_secret,
        time.time(),
        WEBHOOK_TOLERANCE_SECONDS,
    ):
        logger.warning("%s: resend", WEBHOOK_SIGNATURE_REFUSED)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid signature")

    await webhooks.record(request.headers["svix-id"], kept_of(await request.json()))
