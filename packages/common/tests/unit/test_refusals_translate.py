"""A refusal's text is the key to its translations, so one built with an f-string never matches
and reaches every language in English: a text with values is a TemplateError."""

import ast
from pathlib import Path

from service_code import service_code

ROOT = Path(__file__).resolve().parents[4]

# Files allowed one, with why.
ALLOWED = {
    # Web hooks' answer to the ATS calling, which no person reads.
    "services/ats/src/ats/services/ats_webhooks.py",
}


def built_with_fstring(path: Path) -> bool:
    for node in ast.walk(ast.parse(path.read_text())):
        if isinstance(node, ast.Call) and getattr(node.func, "id", "") == "HTTPException":
            details = [*node.args, *(keyword.value for keyword in node.keywords)]

            if any(isinstance(detail, ast.JoinedStr) for detail in details):
                return True

    return False


def test_no_refusal_is_built_with_an_fstring():
    found = [
        str(path.relative_to(ROOT))
        for path in service_code(ROOT)
        if built_with_fstring(path) and str(path.relative_to(ROOT)) not in ALLOWED
    ]

    assert found == []
