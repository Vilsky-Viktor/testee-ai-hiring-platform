# Who may call each /internal route of this service that takes a service token; any other
# service is refused, and a route not listed here refuses everyone.
INTERNAL_CALLERS = {
    "GET /internal/help/knowledge": {"assistant"},
    "POST /internal/news/titles": {"notifications"},
    "GET /internal/news/{news_id}": {"notifications"},
    "POST /internal/users/{user_id}/export": {"accounts"},
}
