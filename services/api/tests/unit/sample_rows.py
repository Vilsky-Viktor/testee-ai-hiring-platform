import uuid

from tests.unit.ids import CANDIDATE, INTERVIEW


def interview(**changes) -> dict:
    """An interview as companies' internal API returns it."""
    return {
        "id": str(INTERVIEW),
        "title": "Backend",
        "status": "in_process",
        "set_id": str(uuid.uuid4()),
        "generation_failed": False,
        "pass_mark": 70,
        "candidate_count": 1,
        "created_at": "2026-10-01T09:00:00Z",
        **changes,
    }


def candidate(**changes) -> dict:
    return {
        "id": str(CANDIDATE),
        "email": "anna@example.com",
        "name": "Anna Nowak",
        "status": "finished",
        "progress": 100,
        "grade": 86,
        "passed": True,
        "tab_leaves": 0,
        "copies": 1,
        "fast_answers": 0,
        "created_at": "2026-10-02T10:30:00Z",
        **changes,
    }
