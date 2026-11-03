from typing import Annotated

from fastapi import APIRouter, Query, Request
from testee_common.i18n.i18n import request_language

from site_content.constants.search import (
    MAX_SEARCH_LENGTH,
    MAX_SEARCH_RESULTS,
    SEARCH_RESULTS,
    SearchKind,
)
from site_content.helpers.search import search
from site_content.schemas.search import SearchResultOut

router = APIRouter(prefix="/search", tags=["search"])


@router.get("")
def search_pages(
    request: Request,
    q: Annotated[str, Query(max_length=MAX_SEARCH_LENGTH)] = "",
    kind: SearchKind | None = None,
    limit: Annotated[int, Query(ge=1, le=MAX_SEARCH_RESULTS)] = SEARCH_RESULTS,
) -> list[SearchResultOut]:
    """The site's public pages matching `q` in the page's language, best first: pages, legal
    texts, guides, comparisons and the FAQ's questions, or only those of `kind` (the guides hub's
    search); nothing for an empty query; public."""
    q = q.strip()

    if not q:
        return []

    return [SearchResultOut(**item) for item in search(q, request_language(request), kind, limit)]
