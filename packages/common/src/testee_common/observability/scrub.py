"""Personal data and secrets taken out of what leaves us for a processor (Sentry, Langfuse)."""

import re

from testee_common.ai.secrets_check import PATTERNS
from testee_common.config.constants import EMAIL_PATTERN
from testee_common.observability.scrub_patterns import (
    IP_PATTERN,
    PERSON_FIELD_ENDINGS,
    PERSON_FIELD_PATTERN,
    QUERY_FIELDS,
    REDACTED_EMAIL,
    REDACTED_IP,
    REDACTED_PERSON,
    REDACTED_SECRET,
    SECRET_PATTERNS,
    URL_PATTERN,
    URL_SCRUBBED,
)

SECRETS = (*(pattern for pattern, _ in PATTERNS), *map(re.compile, SECRET_PATTERNS))


def scrub_text(text: str) -> str:
    """A text with its URLs cut, and its email addresses, secrets and IP addresses taken out."""
    text = re.sub(EMAIL_PATTERN, REDACTED_EMAIL, re.sub(URL_PATTERN, URL_SCRUBBED, text))

    for pattern in SECRETS:
        text = pattern.sub(REDACTED_SECRET, text)

    return re.sub(IP_PATTERN, REDACTED_IP, text)


def scrub(value):
    """Replaces every email address, secret and IP address, however deep it sits, and cuts every
    URL to its scheme and host: outgoing calls' URLs (web hooks, Slack) and invite links are
    secrets. Fields that hold a query alone are dropped."""
    if isinstance(value, str):
        return scrub_text(value)

    if isinstance(value, dict):
        return {key: scrub(item) for key, item in value.items() if key not in QUERY_FIELDS}

    if isinstance(value, list | tuple):
        return [scrub(item) for item in value]

    return value


def is_person_field(key) -> bool:
    return isinstance(key, str) and key.lower().endswith(PERSON_FIELD_ENDINGS)


def person_values(value) -> set[str]:
    """The texts of the `name` and `email` fields in data, however deep."""
    if isinstance(value, dict):
        fields = {item for key, item in value.items() if is_person_field(key) and item}
        found = {item for item in fields if isinstance(item, str)}

        return found.union(*(person_values(item) for item in value.values()))

    if isinstance(value, list | tuple):
        return set().union(*(person_values(item) for item in value))

    return set()


def scrub_people(value, hidden: tuple[str, ...] = ()):
    """`scrub`, and also people's names: the value of a field named `name` or `email` or ending
    so (`candidate_name`, `firstName`), in data or in JSON text (a tool's result), and each of
    `hidden` (a name the caller knows is in the text). Any other object is scrubbed as its JSON
    form or its text."""
    if hasattr(value, "model_dump"):
        value = value.model_dump(mode="json")

    if isinstance(value, str):
        value = re.sub(PERSON_FIELD_PATTERN, rf'\1"{REDACTED_PERSON}"', scrub(value))

        for word in hidden:
            value = re.sub(rf"\b{re.escape(word)}\b", REDACTED_PERSON, value)

        return value

    if isinstance(value, dict):
        return {
            key: REDACTED_PERSON
            if is_person_field(key) and isinstance(item, str)
            else scrub_people(item, hidden)
            for key, item in value.items()
            if key not in QUERY_FIELDS
        }

    if isinstance(value, list | tuple):
        return [scrub_people(item, hidden) for item in value]

    if value is None or isinstance(value, bool | int | float):
        return value

    return scrub_people(str(value), hidden)
