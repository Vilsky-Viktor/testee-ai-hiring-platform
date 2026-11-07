import pytest

from billing.schemas.internal import WelcomeIn


@pytest.mark.parametrize(
    ("sent", "kept"),
    [
        ("abc_12-3", "abc_12-3"),
        (None, None),
        ("", None),
        ("abc", None),
        ("a" * 17, None),
        ("abc; other=1", None),
    ],
)
def test_only_a_code_that_reads_right_is_a_referral(sent, kept):
    assert WelcomeIn(owner_email="a@example.com", referral=sent).referral == kept
