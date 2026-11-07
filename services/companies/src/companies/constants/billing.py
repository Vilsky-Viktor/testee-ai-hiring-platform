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

# Billing is one instance every hiring action leans on: a read gives up well before the default
# timeout, so a slow billing can't fill this service's slots. Writes (hold, charge) keep the default.
READ_TIMEOUT_SECONDS = 3
# How long this instance remembers a company has paid.
PAID_CACHE_SECONDS = 600
