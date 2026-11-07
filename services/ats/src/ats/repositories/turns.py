from sqlalchemy import func, select

from ats.constants.ats import RECOVER_LIMIT


def in_turns(model, conditions: tuple, oldest_first) -> select:
    """The `model` rows matching `conditions`, each connection's in turn (every connection's
    oldest, then every one's second...), at most RECOVER_LIMIT: one company's backlog doesn't
    hold up the others."""
    ranked = (
        select(
            model.id,
            oldest_first.label("since"),
            func.row_number()
            .over(partition_by=model.connection_id, order_by=oldest_first)
            .label("turn"),
        )
        .where(*conditions)
        .subquery()
    )

    return (
        select(model)
        .join(ranked, ranked.c.id == model.id)
        .order_by(ranked.c.turn, ranked.c.since)
        .limit(RECOVER_LIMIT)
    )
