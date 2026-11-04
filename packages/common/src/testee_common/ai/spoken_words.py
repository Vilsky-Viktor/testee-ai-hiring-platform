"""How far spoken words are from the text that was to be said: rounds' check of a question read
aloud (the speech model's own transcript against the script) and the evals' reading test. Word by
word, case and punctuation aside."""

import re
import unicodedata

# Scripts written without spaces between words (Thai, Japanese kana, Chinese characters): each
# character counts as a word, so one slip isn't a whole clause wrong.
UNSPACED = "\u0e00-\u0e7f\u3040-\u30ff\u4e00-\u9fff"
WORD = re.compile(rf"[{UNSPACED}]|[^\W_{UNSPACED}]+")
WORD_UNSPACED = re.compile(rf"[{UNSPACED}]")


def words(text: str) -> list[str]:
    """The text's words, case and punctuation aside; a hyphen or a slash splits them ("B-tree"
    and "B tree" alike), and each character of a script without spaces is one."""
    text = unicodedata.normalize("NFKC", text).lower()

    return WORD.findall(text)


def without_letters(found: list[str]) -> list[str]:
    """The words but those of one letter outside the unspaced scripts: options' letters, which a
    transcript may write in its own alphabet ("Б" for a spoken B), are checked apart."""
    return [word for word in found if len(word) > 1 or WORD_UNSPACED.match(word)]


def word_errors(said: str, heard: str, letters: bool = True) -> tuple[float, int]:
    """The word error rate of what was heard against what was said (words substituted, left out
    or added, over the words said), and the longest run of words added in one place (an answer
    or a comment the speaker put in). Without `letters`, one-letter words are left out of both
    (without_letters)."""
    a, b = words(said), words(heard)

    if not letters:
        a, b = without_letters(a), without_letters(b)

    # Each cell: (edits, longest added run so far, the added run ending here).
    row = [(j, j, j) for j in range(len(b) + 1)]

    for i, x in enumerate(a, 1):
        previous, row[0] = row[0], (i, 0, 0)

        for j, y in enumerate(b, 1):
            dropped = (row[j][0] + 1, row[j][1], 0)
            run = row[j - 1][2] + 1
            added = (row[j - 1][0] + 1, max(row[j - 1][1], run), run)
            kept = (previous[0] + (x != y), previous[1], 0)
            previous, row[j] = row[j], min(kept, dropped, added, key=lambda cell: cell[0])

    edits, longest, _ = row[-1]

    return edits / max(len(a), 1), longest
