import pytest

from site_content.helpers.search import rank


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
