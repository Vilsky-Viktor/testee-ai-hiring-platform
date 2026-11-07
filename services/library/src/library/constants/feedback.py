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
# A report's comment can name someone, so it goes after this long (12 months); the report stays.
REPORT_COMMENT_KEEP_DAYS = 365
