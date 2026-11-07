# The Idempotency-Key of a new company, interview (the site's start, sent again after a reload)
# or member invite (an assistant action confirmed again) keeps its first result this long: a
# retry within it gets what the first made back.
IDEMPOTENCY_SECONDS = 60 * 60
