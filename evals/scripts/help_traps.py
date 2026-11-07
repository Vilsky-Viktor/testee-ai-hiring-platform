"""Planted answers the help chat's judge must catch, made by code from each run's own right
answers, so its passed and made-up scores count only with a judge that works (.claude/rules/
evals.md): a made-up promise appended, the numbers moved, the same answer in the wrong language;
each answer as it was must stay passed. A reply that needs sign-in without its marker is the
code's check (help_chat.py marker_ok), planted too."""

import random
import re

from assistant_judge_traps import MADE_UP, kappa
from stats import share

SEED = 7
NUMBER = re.compile(r"\d+")
# Cases about the reply's language have their own idea of the right one.
LANGUAGE_KIND = "language"


def numbers_moved(text: str) -> str | None:
    """`text` with each number off by a few, or None when it holds none."""
    moved = NUMBER.sub(lambda found: str(int(found.group()) + 3), text)

    return moved if moved != text else None


def picked(rows: list[dict], count: int, rng: random.Random) -> list[dict]:
    return rng.sample(rows, min(count, len(rows)))


async def judge_traps(rows, items, count, review, wrong_language, marker_ok) -> dict:
    """What the judge did with planted answers made from `rows`' right ones, at most `count` of
    each kind. `review(item, found)` judges an answer; `wrong_language(item, text)` is that text
    in another language than the right one."""
    rng = random.Random(SEED)
    by_id = {item["id"]: item for item in items}
    right = [row for row in rows if row["passed"] and row["marker_ok"] and not row["made_up"]]
    pairs: list[tuple[bool, bool]] = []
    caught: dict[str, list[bool]] = {"made_up": [], "numbers": [], "language": [], "marker": []}
    missed = []
    spent: list[float] = []

    async def planted(kind: str, row: dict, text: str) -> None:
        verdict = await review(by_id[row["id"]], {"text": text})
        spent.append(verdict["judge_cost"])
        found = verdict["made_up"] or (kind != "made_up" and not verdict["passed"])
        caught[kind].append(found)
        pairs.append((True, found))

        if not found:
            missed.append({"kind": kind, "id": row["id"], "text": text})

    for row in picked(right, count, rng):
        await planted("made_up", row, row["text"] + MADE_UP)

    for row in picked([r for r in right if NUMBER.search(r["text"])], count, rng):
        await planted("numbers", row, numbers_moved(row["text"]))

    plain = [r for r in right if by_id[r["id"]]["kind"] != LANGUAGE_KIND]

    for row in picked(plain, count, rng):
        await planted("language", row, await wrong_language(by_id[row["id"]], row["text"]))

    for row in picked(
        [r for r in right if str(by_id[r["id"]]["sign_in"]).startswith("[[")], count, rng
    ):
        without = row["text"].replace(by_id[row["id"]]["sign_in"], "")
        caught["marker"].append(not marker_ok(by_id[row["id"]], without))

    kept = []

    for row in picked(right, count, rng):
        verdict = await review(by_id[row["id"]], {"text": row["text"]})
        spent.append(verdict["judge_cost"])
        wrong = verdict["made_up"] or not verdict["passed"]
        kept.append(not wrong)
        pairs.append((False, wrong))

    scores = {kind: share(sum(found), len(found)) for kind, found in caught.items() if found}

    return {
        "caught": scores,
        "kept": share(sum(kept), len(kept)),
        "kappa": kappa(pairs),
        "missed": missed,
        "cost": round(sum(spent), 4),
    }
