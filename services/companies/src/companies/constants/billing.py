# What billing's history says a movement was: a top-up, or a candidate's charge.
class Reason:
    TOPUP = "topup"
    CANDIDATE = "candidate"


# The credit history's file: a row for each movement.
HISTORY_COLUMNS = (
    "date",
    "type",
    "credits",
    "paid",
    "currency",
    "automatic",
    "candidate_name",
    "candidate_email",
    "interview",
    "invoice_id",
    "note",
)
# The file's name, with the day it was made (UTC).
HISTORY_FILE_NAME = "testee-credit-history-{day}.csv"

# How often a new company's welcome credits are asked for before the company is removed again.
WELCOME_ATTEMPTS = 3
# The first wait before asking again, doubling after each try (with jitter): the owner is waiting.
WELCOME_FIRST_WAIT_SECONDS = 0.2
