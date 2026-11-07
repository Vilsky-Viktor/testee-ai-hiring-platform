# Who may call each /internal route of this service that takes a service token; any other
# service is refused, and a route not listed here refuses everyone.
INTERNAL_CALLERS = {
    "POST /internal/accounts/lookup": {"companies"},
    "POST /internal/accounts/profiles": {"companies"},
    "GET /internal/accounts/{user_id}": {"companies", "notifications"},
    "POST /internal/users/email-recipients": {"billing", "notifications"},
    "GET /internal/users/ids": {"notifications"},
    "POST /internal/users/with-setting": {"notifications"},
    "POST /internal/users/{user_id}/unsubscribe": {"notifications"},
}
