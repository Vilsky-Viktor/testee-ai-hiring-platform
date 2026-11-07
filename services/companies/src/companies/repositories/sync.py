from datetime import datetime
from uuid import UUID

from sqlalchemy import Uuid, literal, tuple_


def from_cursor(order: list, since: datetime, after: UUID | None) -> list:
    """The filters that sync a list ordered by `order` (a time, then an id): rows at `since` or
    later; with `after` (the last row a client got), only rows after it, so rows of the same
    moment are neither repeated nor missed."""
    if after is None:
        return [order[0] >= since]

    return [tuple_(*order) > tuple_(literal(since), literal(after, Uuid))]


def changed_since(model, since: datetime, after: UUID | None) -> tuple[list, list]:
    """The filters and order that sync a list: rows changed at `since` or later, oldest change
    first (from_cursor)."""
    order = [model.updated_at, model.id]

    return from_cursor(order, since, after), order
