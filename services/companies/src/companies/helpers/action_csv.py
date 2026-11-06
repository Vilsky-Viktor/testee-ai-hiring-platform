import csv
import io

from companies.constants.audit import ACTION_COLUMNS
from companies.helpers.bias_audit import as_text
from companies.schemas.audit import ActionOut


def action_row(action: ActionOut) -> list[str]:
    """One action; what people typed is kept from running as a formula."""
    return [
        action.created_at.isoformat(),
        action.group or "",
        action.action,
        action.target_kind or "",
        as_text(action.target),
        as_text(action.user_email),
        as_text(action.key_name),
        action.via or "",
    ]


def action_csv(actions: list[ActionOut]) -> str:
    """The action log's CSV: a header, then a row for each action."""
    out = io.StringIO()
    writer = csv.writer(out)
    writer.writerow(ACTION_COLUMNS)
    writer.writerows(action_row(action) for action in actions)

    return out.getvalue()
