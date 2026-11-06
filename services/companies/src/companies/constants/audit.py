from testee_common.config.constants import VIA_ASSISTANT, VIA_MCP

# Audit events are kept this long (12 months), then the daily retention deletes them.
AUDIT_RETENTION_DAYS = 365


# What an audit event can be recorded through when not a person in the app (audit_events.via).
VIAS = (VIA_ASSISTANT, VIA_MCP)
# A change made with an API key over the API, recorded as the key itself (key_id), never a person.
VIA_API = "api"
# A candidate an ATS sent, invited as the member who connected it.
VIA_ATS = "ats"

# The action log's file: a row for each action.
ACTION_COLUMNS = (
    "date",
    "group",
    "action",
    "about",
    "target",
    "member_email",
    "api_key",
    "via",
)
# The file's name, with the day it was made (UTC).
ACTION_FILE_NAME = "testee-action-log-{day}.csv"

# Why anyone but the owner is refused the audit and action logs.
LOG_NOT_OWNER = "Only the owner can see the action log"
