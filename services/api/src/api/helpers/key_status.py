"""What the API page says about a key or a web hook."""

from datetime import datetime, timedelta

from api.constants.api import KEY_EXPIRING_DAYS
from api.constants.permissions import PERMISSION_PRESETS, Permission

# The states by how much they need the user, for the list's order.
KEY_STATES = ("expired", "expiring", "never_used", "active")


def key_state(
    expires_at: datetime | None, last_used_at: datetime | None, is_expired: bool, now: datetime
) -> str:
    if is_expired:
        return "expired"

    if expires_at is not None and expires_at - now <= timedelta(days=KEY_EXPIRING_DAYS):
        return "expiring"

    return "active" if last_used_at else "never_used"


def key_access(permissions: list[Permission]) -> str:
    """The preset a key's permissions match, or "custom"."""
    chosen = set(permissions)

    for name, preset in PERMISSION_PRESETS.items():
        if chosen == set(preset):
            return name

    return "custom"


def webhook_state(failing: bool, last_delivered: datetime | None) -> str:
    if failing:
        return "paused"

    return "active" if last_delivered else "unused"
