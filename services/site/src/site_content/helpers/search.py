from site_content.constants.faq import FAQS
from site_content.constants.help import GUIDE_PATH, GUIDES_FOLDER
from site_content.constants.search import (
    COMPARE_FOLDER,
    COMPARE_PATH,
    FAQ_PATH,
    LEGAL_PAGES,
    PUBLIC_PAGES,
    SOLUTION_PAGES,
    SearchKind,
)
from site_content.helpers.guide_articles import articles
from site_content.helpers.page_guides import page_guide


def rank(q: str, title: str, text: str = "") -> int | None:
    """How well a page matches `q` (lower is better): its title starts with it, a word of its
    title does, its title contains it, its summary does; None when nothing does."""
    title, text = title.casefold(), text.casefold()

    if title.startswith(q):
        return 0

    if any(word.startswith(q) for word in title.split()):
        return 1

    if q in title:
        return 2

    if q in text:
        return 3

    return None


def pages(language: str) -> list[dict]:
    """Every public page the site's search finds, in `language` where translated: the pages by
    their guide's title, the legal texts, the guides with the solution pages, the comparisons and
    the FAQ's questions."""
    found = [
        {"kind": kind, "title": page_guide(key, language)["title"], "path": path}
        for table, kind in ((PUBLIC_PAGES, SearchKind.PAGE), (LEGAL_PAGES, SearchKind.LEGAL))
        for key, path in table.items()
    ]
    found += [
        {"kind": SearchKind.GUIDE, **page_guide(key, language), "path": path}
        for key, path in SOLUTION_PAGES.items()
    ]
    found += [
        {"kind": kind, "title": item["title"], "text": item["description"], "path": item["path"]}
        for folder, path, kind in (
            (GUIDES_FOLDER, GUIDE_PATH, SearchKind.GUIDE),
            (COMPARE_FOLDER, COMPARE_PATH, SearchKind.COMPARISON),
        )
        for item in articles(language, folder, path)
    ]
    found += [
        {"kind": SearchKind.FAQ, "title": item["question"], "path": FAQ_PATH}
        for item in FAQS[language]
    ]

    return found


def search(q: str, language: str, kind: SearchKind | None, limit: int) -> list[dict]:
    """The pages matching `q`, best first (then in the order above), at most `limit`; only those of
    `kind` when one is named."""
    q = q.casefold()
    ranked = [
        (score, index, page)
        for index, page in enumerate(pages(language))
        if (kind is None or page["kind"] == kind)
        and (score := rank(q, page["title"], page.get("text", ""))) is not None
    ]

    return [
        {"kind": page["kind"], "title": page["title"], "path": page["path"]}
        for _, _, page in sorted(ranked, key=lambda item: item[:2])[:limit]
    ]
