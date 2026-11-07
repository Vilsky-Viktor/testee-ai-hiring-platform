# Who may call each /internal route of this service that takes a service token; any other
# service is refused, and a route not listed here refuses everyone.
INTERNAL_CALLERS = {
    "POST /internal/answer-counts": {"companies"},
    "POST /internal/invite-scores": {"companies"},
    "POST /internal/invites/delete": {"companies"},
    "GET /internal/invites/{invite_id}/answer-patterns": {"companies"},
    "GET /internal/invites/{invite_id}/scorecard": {"companies"},
    "POST /internal/maintenance/resume": {"companies"},
    "GET /internal/maintenance/running": {"companies"},
    "POST /internal/open-to-offers/matches": {"companies"},
    "GET /internal/open-to-offers/{user_id}": {"companies"},
    "POST /internal/sessions": {"companies"},
    "GET /internal/users/ids": {"notifications"},
    "POST /internal/users/{user_id}/export": {"accounts"},
}
