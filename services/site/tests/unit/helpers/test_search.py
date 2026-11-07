import pytest

from site_content.constants.search import SOLUTION_PAGES, SearchKind
from site_content.helpers.page_guides import page_guide
from site_content.helpers.search import rank, search


@pytest.mark.parametrize(
    ("title", "text", "expected"),
    [
        ("Pricing plans", "", 0),
        ("Our pricing", "", 1),
        ("Repricing", "", 2),
        ("Plans", "What testee's pricing is", 3),
        ("Plans", "What it costs", None),
    ],
)
def test_a_title_starting_with_the_query_ranks_first_then_a_word_then_inside_then_its_summary(
    title, text, expected
):
    assert rank("pricing", title, text) == expected


def test_case_does_not_matter():
    assert rank("pricing", "PRICING") == 0


@pytest.mark.parametrize("language", ["en", "de", "ja"])
@pytest.mark.parametrize(("key", "path"), SOLUTION_PAGES.items())
def test_the_solution_pages_are_found_among_the_guides_by_their_title(language, key, path):
    title = page_guide(key, language)["title"]

    assert {
        "kind": SearchKind.GUIDE,
        "title": title,
        "path": path,
    } in search(title, language, SearchKind.GUIDE, 5)


def test_the_solution_pages_are_found_by_their_guides_text():
    words = page_guide("codingTest", "en")["text"].split(": ")[1][:30]

    assert [page["path"] for page in search(words, "en", SearchKind.GUIDE, 5)] == [
        SOLUTION_PAGES["codingTest"]
    ]
