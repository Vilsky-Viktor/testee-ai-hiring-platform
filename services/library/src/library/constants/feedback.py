from enum import StrEnum


class ReportReason(StrEnum):
    WRONG_ANSWER = "wrong_answer"
    UNCLEAR = "unclear"
    HARD_TO_READ = "hard_to_read"
    OFF_TOPIC = "off_topic"
    OTHER = "other"


class ReportStatus(StrEnum):
    OPEN = "open"


MAX_REPORT_COMMENT_LENGTH = 1000
# A report's comment is emptied this long after it was written, or sooner when its report is
# unlinked; the report stays. Its words are free text, which can name someone, so they get a
# limit of their own (privacy policy).
REPORT_COMMENT_KEEP_DAYS = 365
# What takes the user id of an unlinked vote or report, with a random uuid new to each
# row: it means nothing, can't be worked out from their id and joins none of their rows to
# another. No account or guest has this prefix (Firebase's ids are bare, guests' are `guest-`).
UNLINKED_USER_PREFIX = "unlinked-"
