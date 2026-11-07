import asyncio
from collections.abc import Awaitable, Callable, Hashable

import httpx
from testee_common.http.capped import gather_capped

from assistant.constants.show import PAGE_NAMES
from assistant.constants.tool_calls import MAX_PARALLEL_TOOL_CALLS
from assistant.constants.welcome import WELCOME_LIMIT
from assistant.helpers.trimming import trim
from assistant.integrations import services
from assistant.services.registry import tools

# Pages of an interview's candidates read to find the ones a block showed.
MAX_CANDIDATE_PAGES = 5


async def fetch(path: str, query: dict, token: str, language: str):
    """Companies' data for the viewer's own token; None when it's gone, not theirs any more, or
    companies didn't answer."""
    try:
        response = await services.get("companies", path, query, token, language)
    except httpx.HTTPError:
        return None

    return response.json() if response.is_success else None


class Reads:
    """The reads of one opened page, with the viewer's token: whatever many blocks need the same
    thing, it's read once."""

    def __init__(self, token: str, language: str) -> None:
        self.token = token
        self.language = language
        self.started: dict[Hashable, asyncio.Future] = {}

    def once(self, key: Hashable, read: Callable[[], Awaitable]) -> asyncio.Future:
        if key not in self.started:
            self.started[key] = asyncio.ensure_future(read())

        return self.started[key]

    def fetch(self, path: str, query: dict) -> asyncio.Future:
        key = (path, tuple(sorted(query.items())))

        return self.once(key, lambda: fetch(path, query, self.token, self.language))


async def candidates(refs: list[dict], reads: Reads) -> dict[str, dict]:
    """The candidates the refs name, by id, from their interviews' lists."""
    found: dict[str, dict] = {}
    wanted = {ref["id"] for ref in refs}

    for interview_id in dict.fromkeys(ref["interview_id"] for ref in refs if ref["interview_id"]):
        for page in range(MAX_CANDIDATE_PAGES):
            query = {"limit": WELCOME_LIMIT, "offset": page * WELCOME_LIMIT}
            rows = await reads.fetch(f"/interviews/{interview_id}/candidates", query)

            for row in rows or []:
                if row["id"] in wanted:
                    found[row["id"]] = {**row, "interview_id": interview_id}

            if not rows or len(rows) < WELCOME_LIMIT or wanted <= found.keys():
                break

    return found


async def items_for(block: dict, reads: Reads) -> list[dict | None]:
    """Each ref's item as the viewer may see it now, in order; None for one that's gone."""
    refs = block.get("refs", [])
    kind = block["kind"]

    if kind == "candidate_rows":
        found = await candidates(refs, reads)
        fields = tools()["list_candidates"].fields | {"interview_id"}

        return [
            trim(found[ref["id"]], fields, 1, 300) if ref["id"] in found else None for ref in refs
        ]

    if kind == "interview":
        fields = tools()["list_interviews"].fields
        rows = await asyncio.gather(*(reads.fetch(f"/interviews/{ref['id']}", {}) for ref in refs))

        return [trim(row, fields, 1, 300) if row else None for row in rows]

    if kind == "credits":
        balances = {row["id"]: row for row in await reads.fetch("/companies/credits", {}) or []}
        rows = []

        for ref in refs:
            row = balances.get(ref["company_id"])
            row = row or await reads.fetch(f"/companies/{ref['company_id']}/credits", {})
            rows.append(row)

        return rows

    return []


async def live_link(block: dict, reads: Reads) -> dict | None:
    """A stored link, named again with the viewer's token; None when what it names is gone."""
    from assistant.services.show import page_name

    page = block.get("page")
    ids = block.get("ids", {})
    name = None

    if page:
        key = (page, tuple(sorted(ids.items())))
        name = await reads.once(key, lambda: page_name(page, ids, reads.token, reads.language))

    if page in PAGE_NAMES and name is None:
        return None

    return {
        "kind": "link",
        "items": [],
        "links": block.get("links", []),
        "page": page,
        "label": name,
    }


async def live_block(block: dict, reads: Reads) -> dict | None:
    """One stored block as the viewer may see it now; None when nothing of it is left."""
    if block["kind"] == "link":
        return await live_link(block, reads)

    items = await items_for(block, reads)
    kept = [(item, link) for item, link in zip(items, block.get("links", []), strict=False) if item]

    if not kept:
        return None

    return {
        "kind": block["kind"],
        "items": [item for item, _ in kept],
        "links": [link for _, link in kept],
        "all": block.get("all"),
    }


async def live(answers: list[list[dict]], token: str, language: str) -> list[list[dict]]:
    """Stored answers' blocks, fetched again with the viewer's token: what they may see now,
    without anything that's gone (a deleted candidate, a company they left). The blocks of a whole
    page go together: each read once, a few at a time."""
    reads = Reads(token, language)
    blocks = [block for answer in answers for block in answer]
    found = iter(
        await gather_capped(MAX_PARALLEL_TOOL_CALLS, (live_block(block, reads) for block in blocks))
    )
    shown = [[next(found) for _ in answer] for answer in answers]

    return [[block for block in answer if block] for answer in shown]
