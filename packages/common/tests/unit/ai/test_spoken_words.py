import pytest
from testee_common.ai.spoken_words import word_errors, words


def test_words_ignore_case_punctuation_and_hyphens():
    assert words("Which index? A: B-tree.") == ["which", "index", "a", "b", "tree"]


@pytest.mark.parametrize(
    ("heard", "rate", "added"),
    [
        # Read as written, the hyphen aside.
        ("Which index? A: B tree. B: Hash.", 0.0, 0),
        # An answer put in after the options.
        ("Which index? A: B-tree. B: Hash. The answer is A.", 4 / 7, 4),
        # A greeting put in before the question.
        ("Sure, here it is. Which index? A: B-tree. B: Hash.", 4 / 7, 4),
        # An option left out: words missing, nothing added.
        ("Which index? A: B-tree.", 2 / 7, 0),
        # Two words misheard, none added.
        ("Which index? A: Bee tree. Be: Hash.", 2 / 7, 0),
    ],
)
def test_word_errors_count_changes_and_the_longest_run_added(heard, rate, added):
    found_rate, found_added = word_errors("Which index? A: B-tree. B: Hash.", heard)

    assert found_rate == pytest.approx(rate)
    assert found_added == added


def test_nothing_said_against_nothing_to_say_is_no_error():
    assert word_errors("", "") == (0.0, 0)


@pytest.mark.parametrize(
    "said, heard, rate",
    [
        # Chinese: two characters swapped of 17, not the whole clause wrong.
        ("哪种集中趋势的量度受极端值影响最小", "哪种集中趋势的度量受极端值影响最小", 2 / 17),
        # Japanese kana and Thai, each character a word; a Latin letter beside them stays one.
        ("どれですか B", "どれですか B", 0.0),
        ("ข้อแรก", "ข้อแรด", 1 / 6),
    ],
)
def test_scripts_without_spaces_count_each_character(said, heard, rate):
    assert word_errors(said, heard)[0] == pytest.approx(rate)


def test_without_letters_a_transcript_writing_them_in_its_own_alphabet_reads_right():
    said = "Какая мера? A: Медиана. B: Размах."
    heard = "Какая мера? А: Медиана. Б: Размах."

    assert word_errors(said, heard)[0] == pytest.approx(2 / 6)
    assert word_errors(said, heard, letters=False) == (0.0, 0)
    # Characters of unspaced scripts still count, one by one.
    assert word_errors("标准差", "标准", letters=False)[0] == pytest.approx(1 / 3)
