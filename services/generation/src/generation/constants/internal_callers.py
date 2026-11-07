# Who may call each /internal route of this service that takes a service token; any other
# service is refused, and a route not listed here refuses everyone.
INTERNAL_CALLERS = {
    "POST /internal/campaigns/{campaign_id}/translate": {"notifications"},
    "POST /internal/generations": {"companies"},
    "POST /internal/generations/statuses": {"notifications"},
    "GET /internal/generations/{generation_id}": {"companies"},
    "POST /internal/generations/{generation_id}/cancel": {"companies"},
    "POST /internal/generations/{generation_id}/retry": {"companies"},
    "POST /internal/generations/{generation_id}/review": {"companies"},
    "POST /internal/news/{news_id}/translate": {"site"},
    "POST /internal/questions/{question_id}/regenerate": {"companies"},
    "POST /internal/questions/{question_id}/verify": {"library"},
    "POST /internal/users/{user_id}/export": {"accounts"},
}
