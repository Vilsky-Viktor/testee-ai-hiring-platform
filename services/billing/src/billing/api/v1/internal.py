from datetime import UTC, datetime
from typing import Annotated, Literal

from fastapi import APIRouter, HTTPException, Query, status
from fastapi.encoders import jsonable_encoder
from testee_common.config.constants import MAX_PAGE_SIZE
from testee_common.db.paging import IdPageParams, PageParams

from billing.api.dependencies import ServiceCaller
from billing.constants.credits import CANDIDATE_PREFIX
from billing.constants.products import (
    MAX_BUYER_PURCHASES,
    OwnerType,
)
from billing.core.db import Session
from billing.helpers.history import history_entry_out
from billing.helpers.wallets import balance_out, candidates_for
from billing.repositories import history, ledger, purchases
from billing.schemas.billing import (
    AdjustmentIn,
    BalanceOut,
    BuyerPurchaseOut,
    HistoryEntryOut,
    HoldOut,
    InvoiceOut,
    LowCompaniesOut,
    LowCompanyOut,
    OwnersIn,
    PaidOut,
    PurchaseOwnerOut,
    ReferralOut,
    SpentOut,
)
from billing.schemas.internal import SettleIn, WelcomeIn
from billing.services import accounts, holds, invoices, refund_offers, wallets
from billing.services.referrals import referral_out

router = APIRouter(prefix="/internal", tags=["internal"])


@router.post("/candidates/hold", status_code=status.HTTP_204_NO_CONTENT)
async def hold_candidate(company_id: str, key: str, caller: ServiceCaller) -> None:
    """Set aside on invite. Charged once the interview finishes with at least one answer. An
    automatic top-up the balance now calls for is charged before answering, waited for only
    briefly: Paddle can take its time, and the invite waiting on this answer mustn't."""
    await holds.hold(company_id, key)


@router.post("/candidates/charge", status_code=status.HTTP_204_NO_CONTENT)
async def charge_candidate(key: str, caller: ServiceCaller) -> None:
    await holds.charge(key)


@router.post("/candidates/release", status_code=status.HTTP_204_NO_CONTENT)
async def release_candidate(key: str, caller: ServiceCaller) -> None:
    await holds.release(key)


@router.post("/candidates/settle", status_code=status.HTTP_204_NO_CONTENT)
async def settle_candidates(body: SettleIn, caller: ServiceCaller) -> None:
    """A batch of candidates' credits taken or given back in one call, for what removes many at
    once. Each key on its own, so a failure leaves the batch safe to send again."""
    await holds.settle(body.charge, body.release)


@router.get("/candidates/hold")
async def candidate_hold(key: str, caller: ServiceCaller) -> HoldOut:
    """Whether a candidate's credits are set aside, charged or given back, for the admin zone's
    support tab; 404 when none were held."""
    async with Session() as session:
        found = await ledger.hold_status(session, CANDIDATE_PREFIX + key)

    if found is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Not found")

    return HoldOut(status=found)


@router.post("/companies/{company_id}/welcome", status_code=status.HTTP_204_NO_CONTENT)
async def welcome_company(company_id: str, body: WelcomeIn, caller: ServiceCaller) -> None:
    """The company's wallet. The welcome credits come once per owner's email; a company new
    in that sense can be referred by another, unrelated one."""
    await wallets.welcome(company_id, body)


@router.get("/companies/{company_id}/paid")
async def company_paid(company_id: str, caller: ServiceCaller) -> PaidOut:
    async with Session() as session:
        return PaidOut(paid=await purchases.paid(session, OwnerType.COMPANY, company_id))


@router.get("/companies/{company_id}/referral")
async def company_referral(company_id: str, caller: ServiceCaller) -> ReferralOut:
    return await referral_out(OwnerType.COMPANY, company_id)


@router.get("/companies/{company_id}/credits")
async def company_credits(company_id: str, caller: ServiceCaller) -> BalanceOut:
    return await wallets.credits(OwnerType.COMPANY, company_id)


@router.get("/companies/{company_id}/history")
async def company_history(
    company_id: str,
    page: PageParams,
    caller: ServiceCaller,
    kind: Literal["topups", "charges", "refunds"] | None = None,
    start: datetime | None = None,
    end: datetime | None = None,
) -> list[HistoryEntryOut]:
    """Every movement of the company's credits, newest first, or only those of one `kind`, from
    `start` and before `end`."""
    async with Session() as session:
        rows = await history.page(
            session, OwnerType.COMPANY, company_id, page.offset, page.limit, kind, start, end
        )
        refunds = await refund_offers.states(
            session, OwnerType.COMPANY, company_id, rows, datetime.now(UTC)
        )

    return [history_entry_out(row, refunds) for row in rows]


@router.get("/companies/{company_id}/spent")
async def company_spent(company_id: str, caller: ServiceCaller) -> SpentOut:
    """The credits the company's candidates took this calendar month (UTC)."""
    start = datetime.now(UTC).replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    async with Session() as session:
        credits = await history.spent_since(session, OwnerType.COMPANY, company_id, start)

    return SpentOut(credits=credits)


@router.post("/companies/{company_id}/adjustments", status_code=status.HTTP_204_NO_CONTENT)
async def adjust_company(company_id: str, body: AdjustmentIn, caller: ServiceCaller) -> None:
    """A superadmin adds or removes credits (companies checks who and logs it). Safe to repeat
    with the same key; refused when it would take the available balance below zero."""
    await wallets.adjust(company_id, body)


@router.get("/companies/{company_id}/invoice")
async def company_invoice(
    company_id: str, transaction_id: str, caller: ServiceCaller
) -> InvoiceOut:
    """The invoice of one of the company's top-ups; 404 for anyone else's transaction."""
    return await invoices.company_invoice(company_id, transaction_id)


@router.get("/purchases")
async def buyer_purchases(buyer_id: str, caller: ServiceCaller) -> list[BuyerPurchaseOut]:
    """The company top-ups someone paid for, one per transaction, newest first, at most
    MAX_BUYER_PURCHASES, for the admin zone's support tab."""
    async with Session() as session:
        rows = await purchases.bought_by(session, buyer_id, MAX_BUYER_PURCHASES)

    return [
        BuyerPurchaseOut(
            transaction_id=row.transaction_id,
            company_id=row.owner_id,
            total=str(row.total),
            currency=row.currency,
            created_at=row.created_at,
        )
        for row in rows
    ]


@router.get("/purchases/{transaction_id}")
async def purchase_owner(transaction_id: str, caller: ServiceCaller) -> PurchaseOwnerOut:
    """Whose wallet a top-up's Paddle transaction paid into, for the admin zone's support
    search; 404 when no top-up has that transaction."""
    async with Session() as session:
        bought = await purchases.for_transaction(session, transaction_id)

    if bought is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Not found")

    owner_type, owner_id, _, _ = bought

    return PurchaseOwnerOut(owner_type=owner_type, owner_id=owner_id)


@router.post("/companies/credits")
async def companies_credits(body: OwnersIn, caller: ServiceCaller) -> dict[str, BalanceOut]:
    """Several companies' balances at once, for the top-up page."""
    async with Session() as session:
        found = await ledger.wallets(session, OwnerType.COMPANY, body.owner_ids)

    empty = BalanceOut(balance=0, reserved=0, available=0, low=True, candidates=0)

    return {
        owner_id: balance_out(found[owner_id]) if owner_id in found else empty
        for owner_id in body.owner_ids
    }


@router.get("/companies/low")
async def low_companies(
    caller: ServiceCaller,
    page: IdPageParams,
    ids: Annotated[list[str] | None, Query(max_length=MAX_PAGE_SIZE)] = None,
) -> LowCompaniesOut:
    """Companies running low on credits that no automatic top-up refills: for notifications'
    reminders a page at a time by company id (`after`, `limit`), and (only `ids`) the
    assistant's get_updates."""
    async with Session() as session:
        rows = await ledger.running_low(session, OwnerType.COMPANY, ids, page.after, page.limit)

    return LowCompaniesOut(
        companies=[
            LowCompanyOut(
                company_id=row.owner_id,
                available=row.balance - row.reserved,
                candidates=candidates_for(row.balance - row.reserved),
            )
            for row in rows
        ]
    )


@router.delete("/companies/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(company_id: str, caller: ServiceCaller) -> None:
    await accounts.delete_company(company_id)


@router.post("/users/{user_id}/export")
async def export_user(user_id: str, caller: ServiceCaller) -> dict:
    """What the user bought for their companies, the automatic top-ups they turned on (charged
    to their card once started), and the currency they see prices in."""
    return jsonable_encoder(await accounts.export(user_id))
