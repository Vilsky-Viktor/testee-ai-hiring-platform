from testee_common.auth.service_auth import issue_token
from testee_common.auth.tokens import purpose_key
from testee_common.config.constants import ASSISTANT_HEADER_PURPOSE

SECRET = "test-secret-that-is-at-least-32-bytes"


def assistant_header(via: str, extra: dict | None = None) -> str:
    """The X-Assistant header as the assistant signs it."""
    return issue_token(via, "companies", purpose_key(SECRET, ASSISTANT_HEADER_PURPOSE), extra)
