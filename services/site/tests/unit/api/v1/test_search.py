import pytest

from site_content.constants.search import MAX_SEARCH_LENGTH, MAX_SEARCH_RESULTS, PUBLIC_PAGES
from site_content.helpers import guide_articles
from site_content.helpers import search as search_helper

# The test's own pages' titles by language, as their guides would give them.
TITLES = {
    "en": {"pricing": "Pricing", "about": "About testee", "terms": "Terms of service"},
    "de": {"pricing": "Preise", "about": "Über testee", "terms": "Nutzungsbedingungen"},
}
GUIDE = '---\ntitle: "{title}"\ndescription: "{description}"\n---\n\n# {title}\n\nText.\n'


@pytest.fixture
def site(tmp_path, monkeypatch):
    """The test's own site: two pages, one legal text, a guide (also in German), a comparison
    and one question in the FAQ."""
    for folder, slug, title, description in (
        ("guides", "hire-testers", "How to hire testers", "Price a test fairly."),
        ("de/guides", "hire-testers", "Tester einstellen", "Ein Prozess."),
        ("compare", "testee-vs-other", "testee vs Other", "Pricing side by side."),
    ):
        (tmp_path / folder).mkdir(parents=True)
        text = GUIDE.format(title=title, description=description)
        (tmp_path / folder / f"{slug}.md").write_text(text)

    monkeypatch.setattr(guide_articles, "ARTICLES_ROOT", tmp_path)
    monkeypatch.setattr(search_helper, "PUBLIC_PAGES", {"pricing": "/pricing", "about": "/about"})
    monkeypatch.setattr(search_helper, "LEGAL_PAGES", {"terms": "/terms"})
    monkeypatch.setattr(search_helper, "SOLUTION_PAGES", {})
    monkeypatch.setattr(
        search_helper, "page_guide", lambda key, language: {"title": TITLES[language][key]}
    )
    faq = {"en": [{"question": "What does the pricing include?"}]}
    monkeypatch.setattr(search_helper, "FAQS", faq | {"de": [{"question": "Was kostet es?"}]})


def found(client, language="en", **params):
    response = client.get("/search", params=params, headers={"Accept-Language": language})

    assert response.status_code == 200

    return [(item["kind"], item["title"], item["path"]) for item in response.json()]


def test_pages_are_found_best_match_first(client, site):
    assert found(client, q="pric") == [
        ("page", "Pricing", "/pricing"),
        ("faq", "What does the pricing include?", "/faq"),
        ("guide", "How to hire testers", "/guides/hire-testers"),
        ("comparison", "testee vs Other", "/compare/testee-vs-other"),
    ]


def test_only_the_kind_asked_for_is_found(client, site):
    assert found(client, q="test", kind="guide") == [
        ("guide", "How to hire testers", "/guides/hire-testers")
    ]
    assert found(client, q="terms", kind="legal") == [("legal", "Terms of service", "/terms")]


def test_at_most_the_limit_is_found(client, site):
    assert found(client, q="pric", limit=2) == found(client, q="pric")[:2]


def test_pages_are_found_by_their_titles_in_the_pages_language(client, site):
    assert found(client, "de", q="einstellen") == [
        ("guide", "Tester einstellen", "/guides/hire-testers")
    ]
    assert found(client, "de", q="pre") == [("page", "Preise", "/pricing")]
    # The comparison isn't translated yet: found by its English title.
    assert found(client, "de", q="vs") == [
        ("comparison", "testee vs Other", "/compare/testee-vs-other")
    ]


@pytest.mark.parametrize("q", ["", "   ", "nothing like it"])
def test_an_empty_query_or_no_match_finds_nothing(client, site, q):
    assert found(client, q=q) == []


@pytest.mark.parametrize(
    "params",
    [
        {"q": "a", "limit": 0},
        {"q": "a", "limit": MAX_SEARCH_RESULTS + 1},
        {"q": "a", "kind": "everything"},
        {"q": "a" * (MAX_SEARCH_LENGTH + 1)},
    ],
)
def test_a_wrong_query_is_refused(client, site, params):
    assert client.get("/search", params=params).status_code == 422


def test_every_public_page_of_the_real_site_is_found_by_its_title(client):
    """The real pages: each key has a guide, so the search never fails on a page without one."""
    titles = {
        item["path"]: item["title"] for item in search_helper.pages("en") if item["kind"] == "page"
    }

    for path in PUBLIC_PAGES.values():
        title = titles[path]

        assert ("page", title, path) in found(client, q=title, limit=MAX_SEARCH_RESULTS)
