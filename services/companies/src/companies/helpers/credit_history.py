import csv
import io

from companies.constants.billing import HISTORY_COLUMNS
from companies.helpers.bias_audit import as_text
from companies.schemas.billing import HistoryEntryOut


def history_row(entry: HistoryEntryOut) -> list:
    """One movement. Credits stay a number; what people typed is kept from running as a formula."""
    candidate = entry.candidate

    return [
        entry.created_at.isoformat(),
        entry.reason,
        entry.amount,
        entry.paid or "",
        entry.currency or "",
        str(entry.automatic).lower(),
        as_text(candidate.name) if candidate else "",
        as_text(candidate.email) if candidate else "",
        as_text(candidate.interview_title) if candidate else "",
        entry.invoice_id or "",
        as_text(entry.note),
    ]


def history_csv(entries: list[HistoryEntryOut]) -> str:
    """The credit history's CSV: a header, then a row for each movement."""
    out = io.StringIO()
    writer = csv.writer(out)
    writer.writerow(HISTORY_COLUMNS)
    writer.writerows(history_row(entry) for entry in entries)

    return out.getvalue()
