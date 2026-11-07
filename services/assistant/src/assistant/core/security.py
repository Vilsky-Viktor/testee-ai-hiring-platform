from testee_common.auth.service_auth import callee_secret, issue_token
from testee_common.auth.tokens import purpose_key
from testee_common.config.constants import ASSISTANT_HEADER_PURPOSE

SERVICE_NAME = "assistant"


def service_token(callee: str, issuer: str = SERVICE_NAME, extra: dict | None = None) -> str:
    """A token for calling `callee`, signed with that service's key."""
    return issue_token(issuer, callee, callee_secret(callee), extra)


def assistant_header(via: str, extra: dict | None = None) -> str:
    """The X-Assistant header, signed with a key of its own made from companies': it goes to
    every service the assistant calls, and none can call companies with it. Companies reads it
    to audit the reads made through the assistant (or, as "mcp", through an AI app) as such, and
    with `extra` an API key's company and id: it refuses any other company."""
    key = purpose_key(callee_secret("companies"), ASSISTANT_HEADER_PURPOSE)

    return issue_token(via, "companies", key, extra)
