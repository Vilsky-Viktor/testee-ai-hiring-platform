import re

from testee_common.config.constants import DEFAULT_LANGUAGE

from site_content.constants.help import ARTICLES_ROOT, GUIDE_PATH, GUIDE_SLUG, GUIDES_FOLDER

# The site's guide articles, read from where the site keeps them (frontend/content), as the
# site's lib/content.ts reads them: one source for the pages and the assistant.
FRONTMATTER = re.compile(r"^---\n(.*?)\n---\n(.*)$", re.DOTALL)
FIELD = re.compile(r'^(\w+):\s*"(.*)"\s*$')
TOP_HEADING = re.compile(r"^\s*# [^\n]*\n")


def parse(slug: str, text: str, language: str, path: str = GUIDE_PATH) -> dict:
    """An article's frontmatter fields and its Markdown body without its own top heading; `path`
    is where the site shows it, with the slug in it."""
    found = FRONTMATTER.match(text)
    head, body = (found.group(1), found.group(2)) if found else ("", text)
    fields = dict(match.groups() for line in head.split("\n") if (match := FIELD.match(line)))

    return {
        "slug": slug,
        "language": language,
        "title": fields.get("title", slug),
        "description": fields.get("description", ""),
        "updated": fields.get("updated", ""),
        "path": path.format(slug=slug),
        "body": TOP_HEADING.sub("", body, count=1).strip(),
    }


def read(
    slug: str, language: str, kind: str = GUIDES_FOLDER, path: str = GUIDE_PATH
) -> dict | None:
    """An article of the `kind` folder (guides, compare) in `language`; None when there's none."""
    folder = ARTICLES_ROOT if language == DEFAULT_LANGUAGE else ARTICLES_ROOT / language
    file = folder / kind / f"{slug}.md"

    if not file.is_file():
        return None

    return parse(slug, file.read_text(encoding="utf-8"), language, path)


def guide_article(slug: str, language: str) -> dict | None:
    """A guide in `language`, in English until it's translated; None when there's none."""
    if not GUIDE_SLUG.match(slug):
        return None

    return read(slug, language) or read(slug, DEFAULT_LANGUAGE)


def articles(language: str, kind: str = GUIDES_FOLDER, path: str = GUIDE_PATH) -> list[dict]:
    """Every article of the `kind` folder (the English ones are all of them), in `language` where
    translated, by title, without its body."""
    files = sorted((ARTICLES_ROOT / kind).glob("*.md"))
    found = [
        read(file.stem, language, kind, path) or read(file.stem, DEFAULT_LANGUAGE, kind, path)
        for file in files
    ]

    return sorted(
        ({key: value for key, value in item.items() if key != "body"} for item in found if item),
        key=lambda item: item["title"],
    )


def guide_articles(language: str) -> list[dict]:
    """Every guide, in `language` where translated, by title, without its body."""
    return articles(language)
