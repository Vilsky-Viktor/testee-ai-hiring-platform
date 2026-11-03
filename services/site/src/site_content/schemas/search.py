from pydantic import BaseModel

from site_content.constants.search import SearchKind


class SearchResultOut(BaseModel):
    """A public page the site's search found: its title in the page's language, what it is and
    where it is."""

    kind: SearchKind
    title: str
    path: str
