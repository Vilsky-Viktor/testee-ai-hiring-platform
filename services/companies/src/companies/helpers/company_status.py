"""The one thing the companies list says about a company now."""

from companies.constants.verification import VerificationStatus

# Verification waiting for the company: nothing is on its way to a superadmin.
NOT_VERIFIED = (
    VerificationStatus.NONE,
    VerificationStatus.WAITING_EMAIL,
    VerificationStatus.DECLINED,
)


def company_status(
    can_edit: bool, low: bool, verification: VerificationStatus, finished: int
) -> str | None:
    """What needs the user first: credits running low and verification to finish, for those who
    can act on them; else that candidates finished lately; else nothing."""
    if can_edit and low:
        return "low"

    if can_edit and verification in NOT_VERIFIED:
        return "verify"

    return "finished" if finished else None
