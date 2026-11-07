# Our providers' limits, recorded where a call to them is refused (kind "provider:<name>") and
# shown read-only; Cloud Armor's per-IP limit lives in Terraform and is counted from its logs.
PROVIDER_LIMITS = {
    "OPENAI_RATE_LIMIT": "openai",
    # The account ran out of money: all AI stops, so it's logged as an error and alerts at once.
    "OPENAI_QUOTA": "openai",
    # Waiting in generation's own request limiter (GENERATION_CALLS_PER_SECOND).
    "OPENAI_THROTTLED": "openai",
    "RESEND_RATE_LIMIT": "resend",
    # Resend's sending quota used up, its daily or its monthly one.
    "RESEND_DAILY_QUOTA": "resend",
    "ATS_RATE_LIMIT": "ats",
    "FIREBASE_TOKEN_REFUSED": "firebase",
}
