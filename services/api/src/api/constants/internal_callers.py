# Who may call each /internal route of this service that takes a service token; any other
# service is refused, and a route not listed here refuses everyone.
INTERNAL_CALLERS = {
    "GET /internal/companies/{company_id}/active-count": {"companies"},
    "GET /internal/companies/{company_id}/keys/names": {"companies"},
    "POST /internal/keys/verify": {"assistant"},
    "POST /internal/users/{user_id}/export": {"accounts"},
}
