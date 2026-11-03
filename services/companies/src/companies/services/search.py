from companies.constants.search import SEARCH_RESULTS
from companies.core.db import Session
from companies.repositories import search
from companies.schemas.search import SearchResultOut


async def find(user_id: str, q: str) -> list[SearchResultOut]:
    """What the header's search finds in the user's companies: companies first, then interviews,
    then candidates, at most SEARCH_RESULTS together; nothing for an empty query."""
    if not q:
        return []

    async with Session() as session:
        found = [
            SearchResultOut(
                kind="company", title=company.name, company_id=company.id, company=company.name
            )
            for company in await search.companies(session, user_id, q, SEARCH_RESULTS)
        ]
        found += [
            SearchResultOut(
                kind="interview",
                title=interview.title,
                company_id=interview.company_id,
                company=name,
                interview_id=interview.id,
            )
            for interview, name in await search.interviews(session, user_id, q, SEARCH_RESULTS)
        ]
        found += [
            SearchResultOut(
                kind="candidate",
                title=invite.name or invite.email,
                company_id=invite.company_id,
                company=name,
                interview=title,
                interview_id=invite.interview_id,
                invite_id=invite.id,
            )
            for invite, name, title in await search.candidates(session, user_id, q, SEARCH_RESULTS)
        ]

    return found[:SEARCH_RESULTS]
