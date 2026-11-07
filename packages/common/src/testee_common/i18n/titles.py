from collections.abc import Callable
from typing import Annotated

from pydantic import AfterValidator, Field
from testee_common.config.constants import MAX_TITLE_LENGTH, MIN_TITLE_LENGTH, TITLE_TOO_SHORT
from testee_common.i18n.names import one_line


def at_least(minimum: int, too_short: str) -> Callable[[str], str]:
    """A check for an edited name or title: kept on one line (one_line), refused (422,
    `too_short`, translated) under `minimum` characters."""

    def checked(value: str) -> str:
        value = one_line(value)

        if len(value) < minimum:
            raise ValueError(too_short)

        return value

    return checked


# A test's or a template's title as a member or superadmin edits it.
Title = Annotated[
    str,
    Field(max_length=MAX_TITLE_LENGTH),
    AfterValidator(at_least(MIN_TITLE_LENGTH, TITLE_TOO_SHORT)),
]
