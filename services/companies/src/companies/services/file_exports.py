from datetime import UTC, datetime

from fastapi import HTTPException, Response, status

from companies.constants.exports import DATES_REVERSED


def check_dates(start: datetime | None, end: datetime | None) -> None:
    """Refuses a file whose dates are the wrong way round."""
    if start and end and start >= end:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, DATES_REVERSED)


def csv_file(text: str, file_name: str) -> Response:
    """A CSV download, made on request and never kept; `file_name` takes the day it's made (UTC)."""
    name = file_name.format(day=datetime.now(UTC).date().isoformat())

    return Response(
        text,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{name}"',
            "Cache-Control": "no-store",
        },
    )
