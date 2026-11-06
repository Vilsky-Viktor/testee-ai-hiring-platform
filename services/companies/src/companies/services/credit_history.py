from datetime import datetime

from testee_common.config.constants import MAX_PAGE_SIZE
from testee_common.limits.rate_limit import hit_or_skip

from companies.constants.billing import Reason
from companies.core.db import Session
from companies.helpers.credit_history import history_csv
from companies.integrations import billing
from companies.integrations.redis import get_redis
from companies.repositories import credit_invites
from companies.schemas.billing import CreditCandidateOut, HistoryEntryOut


def candidate_out(invite, interview) -> CreditCandidateOut:
    return CreditCandidateOut(
        invite_id=invite.id,
        interview_id=interview.id,
        email=invite.email,
        name=invite.name,
        interview_title=interview.title,
    )


async def page(
    company_id,
    offset: int,
    limit: int,
    kind: str | None = None,
    start: datetime | None = None,
    end: datetime | None = None,
) -> list[HistoryEntryOut]:
    """A page of the company's credit movements, newest first, or only those of one `kind`, from
    `start` and before `end`. Each candidate's charge names its candidate, found by the key of its credits in one query; one whose invite is gone (removed,
    or the candidate deleted their account) says so, and nothing more."""
    rows = await billing.company_history(company_id, offset, limit, kind, start, end)
    async with Session() as session:
        found = await credit_invites.by_hold_keys(
            session, company_id, [row["hold_key"] for row in rows if row["hold_key"]]
        )
    out = []

    for row in rows:
        candidate = None

        if row["reason"] == Reason.CANDIDATE and row["hold_key"] in found:
            candidate = candidate_out(*found[row["hold_key"]])

        out.append(
            HistoryEntryOut(
                id=row["id"],
                amount=row["amount"],
                reason=row["reason"],
                created_at=row["created_at"],
                total=row["total"],
                paid=row["paid"],
                currency=row["currency"],
                automatic=row["automatic"],
                invoice_id=row["transaction_id"] if row["reason"] == Reason.TOPUP else None,
                candidate=candidate,
                candidate_deleted=row["reason"] == Reason.CANDIDATE and candidate is None,
                note=row["note"],
            )
        )

    return out


async def export(company_id, user_id: str, start: datetime | None, end: datetime | None) -> str:
    """The CSV of the company's credit movements from `start` and before `end`, a batch at a
    time; counted against the company's daily exports."""
    await hit_or_skip(
        get_redis(),
        f"rate:credit-history:{company_id}",
        "CREDIT_HISTORY_EXPORTS_PER_DAY",
        company_id=company_id,
        user_id=user_id,
    )
    entries: list[HistoryEntryOut] = []

    while True:
        batch = await page(company_id, len(entries), MAX_PAGE_SIZE, None, start, end)
        entries += batch

        if len(batch) < MAX_PAGE_SIZE:
            return history_csv(entries)


async def reserved(company_id, offset: int, limit: int) -> list[CreditCandidateOut]:
    """Candidates invited who haven't finished, whose credits are set aside, newest first."""
    async with Session() as session:
        rows = await credit_invites.holding(session, company_id, offset, limit)

    return [candidate_out(invite, interview) for invite, interview in rows]
