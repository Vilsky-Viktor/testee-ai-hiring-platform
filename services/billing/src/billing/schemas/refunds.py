from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from billing.constants.payment_failures import TRANSACTION_ID_PATTERN


class PurchaseLeft(BaseModel):
    """What is left of one top-up: the credits it `granted` for `paid` (minor units, tax
    included), the credits not yet taken back or on their way back, and the money already
    returned or on its way. `taken_late`: those of its credits taken back after its 14 days.
    `refundable`: how many of what's left the rules allow, whatever is unspent."""

    transaction_id: str
    bought_at: datetime
    granted: int = 0
    credits_left: int = 0
    paid: int = 0
    refunded: int = 0
    currency: str = ""
    taken_late: int = 0
    refundable: int = 0


class RefundOfferOut(BaseModel):
    """What refunding a top-up now returns: its unspent `credits`, for `amount` (minor units, tax
    included, as a string) in `currency`, what the top-up was paid in. `takes_referral`: the
    top-up paid a referral, so both rewards go back too, however little is refunded. `auto_top_up_on`: the
    company's automatic top-up stays on and charges again once the balance is under its level."""

    credits: int
    amount: str
    currency: str
    takes_referral: bool
    auto_top_up_on: bool


class RefundStateOut(BaseModel):
    """A top-up's refund in the history: `offer` when some of it can be refunded now, `status` of
    its latest refund, and the credits of it held back by credits set aside for candidates (not
    refundable while set aside), with the candidates they make up: revoking their invites would
    add them to the offer."""

    offer: RefundOfferOut | None = None
    status: Literal["processing", "refunded", "declined"] | None = None
    held_back_credits: int = 0
    held_back_candidates: int = 0


class RefundIn(BaseModel):
    transaction_id: str = Field(pattern=TRANSACTION_ID_PATTERN)


class RefundOut(BaseModel):
    """The refund asked for: `refunded` when Paddle approved it at once, else `processing`."""

    status: Literal["processing", "refunded"]
    credits: int
    amount: str
    currency: str
