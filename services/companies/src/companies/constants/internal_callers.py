# Who may call each /internal route of this service that takes a service token; any other
# service is refused, and a route not listed here refuses everyone.
INTERNAL_CALLERS = {
    "POST /internal/candidates/updates": {"assistant"},
    "GET /internal/companies/member-ids": {"notifications"},
    "POST /internal/companies/members": {"billing", "notifications"},
    "GET /internal/companies/{company_id}/access": {"api", "ats", "billing", "notifications"},
    "GET /internal/companies/{company_id}/candidates/removed": {"api"},
    "POST /internal/companies/{company_id}/candidates/search": {"api"},
    "GET /internal/companies/{company_id}/credits": {"api"},
    "GET /internal/companies/{company_id}/interviews": {"api"},
    "POST /internal/companies/{company_id}/interviews": {"api"},
    "GET /internal/companies/{company_id}/interviews/{interview_id}": {"api"},
    "GET /internal/companies/{company_id}/interviews/{interview_id}/candidates": {"api"},
    "DELETE /internal/companies/{company_id}/interviews/{interview_id}/candidates/{invite_id}": {
        "api"
    },
    "GET /internal/companies/{company_id}/interviews/{interview_id}/candidates/{invite_id}": {
        "api"
    },
    "PATCH /internal/companies/{company_id}/interviews/{interview_id}/candidates/{invite_id}": {
        "api"
    },
    "POST /internal/companies/{company_id}/interviews/{interview_id}/candidates/{invite_id}/resend": {
        "api"
    },
    "GET /internal/companies/{company_id}/interviews/{interview_id}/notes": {"api"},
    "POST /internal/companies/{company_id}/interviews/{interview_id}/notes": {"api"},
    "GET /internal/interviews": {"ats"},
    "POST /internal/interviews/waiting": {"notifications"},
    "GET /internal/interviews/waiting/companies": {"notifications"},
    "POST /internal/interviews/{interview_id}/invites": {"api", "ats"},
    "POST /internal/invites/companies": {"notifications"},
    "POST /internal/invites/{invite_id}/undelivered": {"notifications"},
    "DELETE /internal/users/{user_id}": {"accounts"},
    "GET /internal/users/{user_id}/companies": {"assistant", "notifications"},
    "POST /internal/users/{user_id}/export": {"accounts"},
}
