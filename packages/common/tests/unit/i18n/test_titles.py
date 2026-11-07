import pytest
from pydantic import BaseModel, ValidationError
from testee_common.config.constants import TITLE_TOO_SHORT
from testee_common.i18n.names import clean_name
from testee_common.i18n.titles import Title


class Named(BaseModel):
    title: Title


def test_a_title_is_kept_without_the_spaces_around_it():
    assert Named(title="  SQL  ").title == "SQL"


def test_a_title_stays_on_one_line():
    assert Named(title="Backend\r\nBcc: victim@example.com\x00 ").title == (
        "Backend Bcc: victim@example.com"
    )


def test_a_candidates_name_stays_on_one_line():
    assert clean_name(" Ann\r\n", "Lee\tBcc: x@example.com ") == "Ann Lee Bcc: x@example.com"


@pytest.mark.parametrize("title", ["", "   ", "ab", " ab "])
def test_a_title_under_three_characters_is_refused_saying_why(title):
    with pytest.raises(ValidationError) as refused:
        Named(title=title)

    assert TITLE_TOO_SHORT in str(refused.value)


def test_a_title_over_the_limit_is_refused():
    with pytest.raises(ValidationError):
        Named(title="x" * 71)
