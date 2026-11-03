from typing import Annotated

from fastapi import APIRouter, Query
from testee_common.auth.auth import CurrentUser

from companies.constants.invites import MAX_SEARCH_LENGTH
from companies.schemas.search import SearchResultOut
from companies.services import search

router = APIRouter(prefix="/search", tags=["search"])


@router.get("")
async def search_mine(
    user: CurrentUser, q: Annotated[str, Query(max_length=MAX_SEARCH_LENGTH)] = ""
) -> list[SearchResultOut]:
    """The header's search in the user's own companies: companies by name, interviews by title
    and candidates by name or email, in that order, at most five; any member, viewers too."""
    return await search.find(user.uid, q.strip())
