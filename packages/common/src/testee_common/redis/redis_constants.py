# A Redis command whose connection dropped (Redis restarted, or the network blinked) is tried
# again once on a new one, instead of failing its request; a connection idle this long is checked
# before use.
REDIS_RETRIES = 1
REDIS_HEALTH_CHECK_SECONDS = 30
# Connecting to Redis, and each command, gives up after this long (Upstash answers in
# milliseconds from the same region). With Redis unreachable a command costs about 4 s, its try
# and its retry, so a request stays within the 15 s calls between services allow it.
REDIS_TIMEOUT_SECONDS = 2
# What a request refused because Redis doesn't answer is told to wait.
REDIS_DOWN_RETRY_SECONDS = 30
