from datetime import UTC, datetime, timedelta
from secrets import token_urlsafe

from mcp.server.auth.settings import AuthSettings
from mcp.shared.auth import OAuthToken
from testee_common.auth.tokens import hashed, new_token

from assistant.config import settings
from assistant.constants.mcp import (
    ACCESS_SECONDS,
    CONNECT_PATH,
    FUNNEL_CLIENTS,
    MCP_PATH,
    MCP_READ_SCOPE,
    MCP_SCOPE,
    REFRESH_FAMILY_BYTES,
    REFRESH_FAMILY_LENGTH,
    REFRESH_SECONDS,
    TOKEN_BYTES,
    TOKEN_PREFIX,
)


def resource_url() -> str:
    """The MCP endpoint, the one resource testee's access is for."""
    return settings.site_url.rstrip("/") + MCP_PATH


def consent_url(request_id: str = "") -> str:
    """The site's consent page for a request; with none, how every such address starts."""
    return f"{settings.site_url.rstrip('/')}{CONNECT_PATH}?request={request_id}"


def other_resource(resource: str | None) -> bool:
    """A request naming a resource other than the MCP endpoint (RFC 8707); one naming none is
    for the MCP endpoint, the only one."""
    return resource is not None and resource.rstrip("/") != resource_url()


def auth_settings() -> AuthSettings:
    """The site as the authorization server (its root is the issuer) and the MCP endpoint as
    the resource, as URLs the SDK writes without a trailing slash."""
    return AuthSettings(
        issuer_url=settings.site_url.rstrip("/"),
        resource_server_url=resource_url(),
        validate_token_resource=True,
    )


def funnel_client(client_name: str) -> str:
    return FUNNEL_CLIENTS.get(client_name, "other")


def scopes_of(scope: str) -> list[str]:
    """What a connection's scope lets it do: the full scope includes reading."""
    return [MCP_SCOPE, MCP_READ_SCOPE] if scope == MCP_SCOPE else [MCP_READ_SCOPE]


def granted_scope(asked: list[str], read_only: bool) -> str:
    """The scope a connection gets: read only when the app asked for nothing more, or the user
    chose it on the consent page."""
    return MCP_SCOPE if MCP_SCOPE in asked and not read_only else MCP_READ_SCOPE


def family_of(refresh_token: str) -> str:
    """The family a refresh token carries: its connection's, whichever refresh made it."""
    return refresh_token.removeprefix(TOKEN_PREFIX)[:REFRESH_FAMILY_LENGTH]


def new_tokens(scope: str = MCP_SCOPE, family: str | None = None) -> tuple[OAuthToken, dict]:
    """A new access and refresh token for the app, and what the connection keeps of them; a
    refresh passes the replaced token's family on, a new connection gets its own."""
    access, access_hash = new_token(TOKEN_PREFIX, TOKEN_BYTES)
    family = family or token_urlsafe(REFRESH_FAMILY_BYTES)
    refresh, refresh_hash = new_token(f"{TOKEN_PREFIX}{family}", TOKEN_BYTES)
    now = datetime.now(UTC)
    kept = {
        "access_hash": access_hash,
        "access_expires_at": now + timedelta(seconds=ACCESS_SECONDS),
        "refresh_hash": refresh_hash,
        "refresh_family": hashed(family),
        "refresh_expires_at": now + timedelta(seconds=REFRESH_SECONDS),
    }
    token = OAuthToken(
        access_token=access, expires_in=ACCESS_SECONDS, scope=scope, refresh_token=refresh
    )

    return token, kept
