from datetime import UTC, datetime
from uuid import UUID

from fastapi import HTTPException, status
from testee_common.i18n.i18n import TemplateError
from testee_common.limits.limits import limit, record_hit

from api.constants.api import KEY_EXPIRY_MONTHS, KeyExpiry
from api.constants.permissions import (
    DEFAULT_PERMISSIONS,
    IMPLIED,
    PERMISSION_GROUPS,
    PERMISSION_PRESETS,
    Permission,
)
from api.core.db import Session
from api.helpers.key_status import KEY_STATES, key_access, key_state, webhook_state
from api.helpers.keys import add_months, expired, new_key, with_implied
from api.helpers.webhooks import masked
from api.integrations.redis import get_redis
from api.models.api import ApiKey
from api.repositories import keys, webhooks
from api.repositories import webhook_log as webhook_log_store
from api.schemas.manage import (
    ApiSettingsOut,
    KeyOut,
    NewKeyOut,
    WebhookOut,
)
from api.services.idempotency import once_per_key


async def overview(company_id: UUID, editor: bool) -> ApiSettingsOut:
    """The company's keys and web hooks; only an `editor` sees a web hook's whole address."""
    async with Session() as session:
        hooks = await webhooks.of_company(session, company_id)
        company_keys = await keys.of_company(session, company_id)
        delivered = await webhook_log_store.last_delivered(session, [item.id for item in hooks])

    return ApiSettingsOut(
        keys=sorted(
            (key_out(key) for key in company_keys),
            key=lambda key: KEY_STATES.index(key.state),
        ),
        webhooks=sorted(
            (
                WebhookOut.model_validate(hook, from_attributes=True).model_copy(
                    update={
                        "url": hook.url if editor else masked(hook.url),
                        "state": webhook_state(hook.failing, delivered.get(hook.id)),
                        "last_delivered_at": delivered.get(hook.id),
                    }
                )
                for hook in hooks
            ),
            key=lambda hook: hook.state != "paused",
        ),
        expiries=list(KeyExpiry),
        permission_groups=PERMISSION_GROUPS,
        permission_presets=PERMISSION_PRESETS,
        implied=IMPLIED,
        default_permissions=DEFAULT_PERMISSIONS,
    )


def key_out(key: ApiKey) -> KeyOut:
    now = datetime.now(UTC)
    is_expired = expired(key.expires_at, now)

    return KeyOut(
        id=key.id,
        name=key.name,
        shown=key.shown,
        created_at=key.created_at,
        expires_at=key.expires_at,
        expired=is_expired,
        last_used_at=key.last_used_at,
        permissions=key.permissions,
        allowed_ips=key.allowed_ips,
        state=key_state(key.expires_at, key.last_used_at, is_expired, now),
        access=key_access(key.permissions),
    )


async def create_key_once(
    company_id: UUID,
    name: str,
    expiry: KeyExpiry,
    permissions: list[Permission],
    allowed_ips: list[str],
    user_id: str,
    idempotency_key: str | None,
) -> NewKeyOut:
    """create_key, once per the user's Idempotency-Key: the same request again gets the key the
    first made, without the key itself."""

    async def find(key_id: UUID) -> NewKeyOut:
        async with Session() as session:
            row = await keys.get(session, company_id, key_id)

        if row is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "API key not found")

        return NewKeyOut(**key_out(row).model_dump(), key=None)

    return await once_per_key(
        "key",
        user_id,
        company_id,
        idempotency_key,
        {"name": name, "expiry": expiry, "permissions": permissions, "allowed_ips": allowed_ips},
        lambda: create_key(company_id, name, expiry, permissions, allowed_ips, user_id),
        find,
    )


async def create_key(
    company_id: UUID,
    name: str,
    expiry: KeyExpiry,
    permissions: list[Permission],
    allowed_ips: list[str],
    user_id: str,
) -> NewKeyOut:
    key, shown, hashed = new_key()
    months = KEY_EXPIRY_MONTHS[expiry]
    expires_at = add_months(datetime.now(UTC), months) if months else None
    most = await limit(get_redis(), "MAX_API_KEYS")

    async with Session.begin() as session:
        row = await keys.add(
            session,
            company_id,
            name.strip(),
            shown,
            hashed,
            user_id,
            expires_at,
            with_implied(permissions),
            allowed_ips,
            most,
        )

    if row is None:
        await record_hit("MAX_API_KEYS", company_id=company_id, user_id=user_id)

        raise TemplateError(
            status.HTTP_409_CONFLICT, "A company can have up to {limit} API keys", limit=most
        )

    return NewKeyOut(**key_out(row).model_dump(), key=key)


async def rename_key(company_id: UUID, key_id: UUID, name: str, user_id: str) -> KeyOut:
    async with Session.begin() as session:
        row = await keys.rename(session, company_id, key_id, name.strip(), user_id)

    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "API key not found")

    return key_out(row)


async def change_key_permissions(
    company_id: UUID, key_id: UUID, permissions: list[Permission], user_id: str
) -> KeyOut:
    """Replaces the key's permissions, with the reads they imply; the change applies to its next
    call."""
    async with Session.begin() as session:
        row = await keys.change_permissions(
            session, company_id, key_id, with_implied(permissions), user_id
        )

    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "API key not found")

    return key_out(row)


async def set_key_ips(
    company_id: UUID, key_id: UUID, allowed_ips: list[str], user_id: str
) -> KeyOut:
    """Replaces the addresses the key may be used from; the change applies to its next call."""
    async with Session.begin() as session:
        row = await keys.set_allowed_ips(session, company_id, key_id, allowed_ips, user_id)

    if row is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "API key not found")

    return key_out(row)


async def remove_key(company_id: UUID, key_id: UUID, user_id: str) -> None:
    async with Session.begin() as session:
        removed = await keys.remove(session, company_id, key_id, user_id)

    if not removed:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "API key not found")
