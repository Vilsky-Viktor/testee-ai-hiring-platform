import socket
from datetime import UTC, datetime
from uuid import UUID

from fastapi import HTTPException, status
from testee_common.auth.encryption import decrypt, encrypt
from testee_common.http.public_urls import resolved_address
from testee_common.i18n.i18n import TemplateError
from testee_common.limits.limits import limit, record_hit
from testee_common.limits.rate_limit import hit_or_skip

from api.config import settings
from api.constants.api import SECRET_OVERLAP
from api.core.db import Session
from api.helpers.webhooks import new_secret
from api.integrations.redis import get_redis
from api.models.api import Webhook
from api.repositories import webhook_log as webhook_log_store
from api.repositories import webhooks
from api.schemas.manage import NewSecretOut, NewWebhookOut, WebhookAttemptOut, WebhookOut
from api.services import webhooks as webhook_events
from api.services.idempotency import once_per_key


async def create_webhook_once(
    company_id: UUID, url: str, user_id: str, idempotency_key: str | None
) -> NewWebhookOut:
    """create_webhook, once per the user's Idempotency-Key: the same request again gets the web
    hook the first made, with its secret."""

    async def find(webhook_id: UUID) -> NewWebhookOut:
        row = await webhook(company_id, webhook_id)

        return new_webhook_out(row, decrypt(settings.api_encryption_key, row.secret))

    return await once_per_key(
        "webhook",
        user_id,
        company_id,
        idempotency_key,
        {"url": url},
        lambda: create_webhook(company_id, url, user_id),
        find,
    )


def new_webhook_out(row: Webhook, secret: str) -> NewWebhookOut:
    return NewWebhookOut(
        **WebhookOut.model_validate(row, from_attributes=True).model_dump(), secret=secret
    )


async def create_webhook(company_id: UUID, url: str, user_id: str) -> NewWebhookOut:
    """A web hook to an HTTPS address on the public internet, with a new signing secret."""
    if not settings.api_encryption_key:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Web hooks aren't set up yet")

    url = url.strip()

    try:
        address = await resolved_address(url)
    except socket.gaierror:
        address = None

    if address is None:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            "Use an HTTPS address that's reachable from the internet",
        )

    secret = new_secret()
    sealed = encrypt(settings.api_encryption_key, secret)
    most = await limit(get_redis(), "MAX_WEBHOOKS")

    async with Session.begin() as session:
        row = await webhooks.add(session, company_id, url, sealed, user_id, most)

    if row is None:
        await record_hit("MAX_WEBHOOKS", company_id=company_id, user_id=user_id)

        raise TemplateError(
            status.HTTP_409_CONFLICT, "A company can have up to {limit} web hooks", limit=most
        )

    return new_webhook_out(row, secret)


async def rotate_secret(company_id: UUID, webhook_id: UUID, user_id: str) -> NewSecretOut:
    """A new signing secret for the web hook, shown once; the old one signs too for
    SECRET_OVERLAP, so the receiver switches over without missing an event."""
    secret = new_secret()
    until = datetime.now(UTC) + SECRET_OVERLAP
    sealed = encrypt(settings.api_encryption_key, secret)

    async with Session.begin() as session:
        rotated = await webhooks.rotate(session, company_id, webhook_id, sealed, until, user_id)

    if rotated is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Web hook not found")

    return NewSecretOut(secret=secret, previous_until=until)


async def remove_webhook(company_id: UUID, webhook_id: UUID, user_id: str) -> None:
    async with Session.begin() as session:
        removed = await webhooks.remove(session, company_id, webhook_id, user_id)

    if not removed:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Web hook not found")


async def webhook(company_id: UUID, webhook_id: UUID) -> Webhook:
    async with Session() as session:
        found = await webhooks.get(session, company_id, webhook_id)

    if found is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Web hook not found")

    return found


async def webhook_log(company_id: UUID, webhook_id: UUID) -> list[WebhookAttemptOut]:
    hook = await webhook(company_id, webhook_id)

    async with Session() as session:
        rows = await webhook_log_store.latest(session, hook.id)

    return [WebhookAttemptOut.model_validate(row, from_attributes=True) for row in rows]


async def test_webhook(company_id: UUID, webhook_id: UUID, user_id: str) -> tuple[bool, str]:
    """A signed test event sent to the company's web hook now, up to WEBHOOK_TESTS_PER_HOUR a
    company; whether it took it, and what its log says about it. The company's action log gets
    it as `user_id`'s."""
    hook = await webhook(company_id, webhook_id)
    await hit_or_skip(
        get_redis(),
        f"rate:webhook-tests:{company_id}",
        "WEBHOOK_TESTS_PER_HOUR",
        company_id=company_id,
        user_id=user_id,
    )
    ok = await webhook_events.test(hook)

    async with Session.begin() as session:
        await webhooks.tested(session, hook, user_id)
        attempts = await webhook_log_store.latest(session, hook.id)

    return ok, attempts[0].result
