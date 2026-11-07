# What scrub.py takes out of Sentry's events and Langfuse's traces (an email: constants.
# EMAIL_PATTERN).
REDACTED_EMAIL = "[email]"
REDACTED_SECRET = "[secret]"
REDACTED_IP = "[ip]"
# Secrets beyond the shapes the chats refuse (ai/secrets_check.py PATTERNS): AI apps' tokens,
# Resend's and Langfuse's keys, Turnstile's secret, and a web hook secret's base64.
SECRET_PATTERNS = (
    r"\btem_[A-Za-z0-9_-]{20,}",
    r"\bre_[A-Za-z0-9_]{20,}",
    r"\b[ps]k-lf-[A-Za-z0-9-]{20,}",
    r"\b0x[A-Za-z0-9_-]{30,}",
    r"\bwhsec_[A-Za-z0-9+/=_-]{20,}",
)
# An address in a rate limit's key, which Sentry's Redis breadcrumbs keep: IPv4, and IPv6 with
# four parts or more or a "::", so a time (12:34:56) stays.
IP_PATTERN = (
    r"\b(?:\d{1,3}\.){3}\d{1,3}\b"
    r"|\b(?:[0-9A-Fa-f]{1,4}:){4,7}[0-9A-Fa-f:]*"
    r"|\b(?:[0-9A-Fa-f]{1,4}:)+:[0-9A-Fa-f:]*"
)
# A URL's path, query and user info can carry credentials (a Slack web hook's path, a customer's
# web hook secret, an invite token): only its scheme and host (group 1) reach Sentry, and the
# fields that hold a query alone are dropped.
URL_PATTERN = r"(https?://)(?:[^\s/?#@'\"]*@)?([^\s/?#'\"]+)[^\s'\"]*"
URL_SCRUBBED = r"\1\2"
QUERY_FIELDS = {"query_string", "http.query", "http.fragment"}
# Langfuse: a person's name or email in a field of data or of JSON text (an assistant tool's
# result) is masked too: any field whose name ends so (`candidate_name`); group 1 keeps the key.
PERSON_FIELD_ENDINGS = ("name", "email")
PERSON_FIELD_PATTERN = r'("[a-z_]*(?:name|email)"\s*:\s*)"(?:[^"\\]|\\.)*"'
REDACTED_PERSON = "[person]"
