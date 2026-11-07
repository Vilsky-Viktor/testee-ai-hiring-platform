import re

from testee_common.config.constants import MAX_CANDIDATE_NAME_LENGTH

CONTROL_CHARACTERS = re.compile(r"[\x00-\x1f\x7f]")


def one_line(text: str) -> str:
    """A text of one line: control characters (line ends that could add an email header) and runs
    of spaces become one space, none at either end."""
    return " ".join(CONTROL_CHARACTERS.sub(" ", text).split())


def clean_name(*parts) -> str | None:
    """A candidate's name from untrusted fields (a sign-in, an inviter, an ATS: a whole name, or
    a first and a last name): the text ones joined, trimmed and cut to MAX_CANDIDATE_NAME_LENGTH;
    None when there's none. Shown only as text."""
    name = one_line(" ".join(part for part in parts if isinstance(part, str)))

    return name[:MAX_CANDIDATE_NAME_LENGTH].strip() or None
