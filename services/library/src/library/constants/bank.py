# Questions the filter is offered at once (generation's bank filter job pages through them).
MAX_BANK_CANDIDATES = 100
# Bank copies the daily sweep takes out at most; the rest go the next day.
BANK_SWEEP_BATCH = 500
# Answers a company's question needs before the filter is asked about it and it can join the
# bank: most interviews have about 15 candidates, so the quality statistics' MIN_ANSWERS would
# keep nearly every question out. The filter's blind key check stands in for the statistics
# meanwhile; the same count as template questions' reuse (MIN_REUSE_ANSWERS).
BANK_MIN_ANSWERS = 5
