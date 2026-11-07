from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel


class CreditCandidateOut(BaseModel):
    """The candidate whose invite set credits aside or was charged for, and their interview."""

    invite_id: UUID
    interview_id: UUID
    email: str
    name: str | None
    interview_title: str | None


class SpentOut(BaseModel):
    """The credits the company's candidates took this calendar month."""

    credits: int


class RefundOfferOut(BaseModel):
    """What refunding a top-up now returns, as billing decides it: its unspent `credits`, for
    `amount` (minor units, tax included) in `currency`. `takes_referral`: the referral rewards go
    back too. `auto_top_up_on`: the company's automatic top-up stays on."""

    credits: int
    amount: str
    currency: str
    takes_referral: bool
    auto_top_up_on: bool


class RefundStateOut(BaseModel):
    """A top-up's refund: `offer` when some of it can be refunded now, `status` of its latest
    refund, and the credits and candidates of it held back by credits set aside, which a
    revoked invite makes refundable."""

    offer: RefundOfferOut | None
    status: Literal["processing", "refunded", "declined"] | None
    held_back_credits: int
    held_back_candidates: int


class HistoryEntryOut(BaseModel):
    """One movement of the company's credits: `amount` is signed, `reason` says what it was.
    `total` (minor units, tax included) and `currency` are the money a top-up cost or a refund
    or chargeback moved, when known. `invoice_id` is the top-up's transaction, whose invoice
    can be opened. A candidate's charge names the candidate, or `candidate_deleted` when their
    invite is gone."""

    id: UUID
    amount: int
    reason: str
    created_at: datetime
    total: str | None
    # `total` in the currency's whole units, as a plain number.
    paid: str | None
    currency: str | None
    automatic: bool
    invoice_id: str | None
    candidate: CreditCandidateOut | None
    candidate_deleted: bool
    # Why a superadmin adjusted the credits (reason "adjustment").
    note: str | None = None
    # A top-up's: whether it can be refunded now, and its latest refund.
    refund: RefundStateOut | None = None


class InvoiceOut(BaseModel):
    """A temporary link to the invoice PDF."""

    url: str
