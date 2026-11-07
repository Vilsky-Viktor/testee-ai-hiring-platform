# Who may call each /internal route of this service that takes a service token; any other
# service is refused, and a route not listed here refuses everyone.
INTERNAL_CALLERS = {
    "GET /internal/companies/{company_id}/active-count": {"companies"},
    "POST /internal/updates": {"assistant"},
    "POST /internal/users/{user_id}/export": {"accounts"},
}
