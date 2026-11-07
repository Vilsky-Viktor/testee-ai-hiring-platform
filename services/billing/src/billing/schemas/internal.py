import re

from pydantic import BaseModel, Field, field_validator
from testee_common.config.constants import MAX_PAGE_SIZE, REFERRAL_CODE_PATTERN

from billing.constants.credits import MOST_SETTLED


class SettleIn(BaseModel):
    """Candidates' hold keys: those to charge and those to give back."""

    charge: list[str] = Field(default=[], max_length=MOST_SETTLED)
    release: list[str] = Field(default=[], max_length=MOST_SETTLED)


class WelcomeIn(BaseModel):
    owner_email: str
    # Where the owner is as they create it: the company's currency is that country's.
    country: str | None = None
    # The code of the link the owner came through, and their other companies, which can't
    # refer this one.
    referral: str | None = None
    related: list[str] = Field(default=[], max_length=MAX_PAGE_SIZE)

    @field_validator("referral")
    @classmethod
    def only_a_real_code(cls, code: str | None) -> str | None:
        """A cookie that doesn't read like a code is no referral, and never fails the company."""
        return code if code and re.fullmatch(REFERRAL_CODE_PATTERN, code) else None
