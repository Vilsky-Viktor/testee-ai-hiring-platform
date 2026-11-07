from contextvars import ContextVar

from testee_common.auth.service_auth import callee_secret, issue_token, token_claims
from testee_common.auth.tokens import purpose_key
from testee_common.config.constants import ASSISTANT_HEADER_PURPOSE

from companies.config import settings
from companies.constants.audit import VIAS

SERVICE_NAME = "companies"


def service_token(callee: str) -> str:
    """A token for calling `callee` (library, rounds, ...), signed with that service's key."""
    return issue_token(SERVICE_NAME, callee, callee_secret(callee))


def assistant_claims(token: str | None) -> dict:
    """What a user's request came through, when not the app itself, from its X-Assistant header:
    a token the assistant signed with the header's own key, issued as the in-app assistant
    ("assistant") or an AI app connected over MCP ("mcp"); for an AI agent signed in with an API
    key, also the key's company and id. Empty for a missing or forged one."""
    key = purpose_key(settings.service_secret, ASSISTANT_HEADER_PURPOSE)
    claims = token_claims(token, key, SERVICE_NAME) if token else None

    return claims if claims and claims["iss"] in VIAS else {}


def via_of(token: str | None) -> str | None:
    return assistant_claims(token).get("iss")


# What the request being handled came through, for the access checks (services/access.py), and
# for an AI agent signed in with an API key the one company it may reach and the key, as text:
# the key acts there as itself (services/access.py key_member).
REQUEST_VIA: ContextVar[str | None] = ContextVar("request_via", default=None)
REQUEST_COMPANY: ContextVar[str | None] = ContextVar("request_company", default=None)
REQUEST_KEY: ContextVar[str | None] = ContextVar("request_key", default=None)
