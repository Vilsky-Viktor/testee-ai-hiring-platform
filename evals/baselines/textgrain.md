# textGrain watermark: before and after

OpenAI's textGrain is a dashboard setting, not a request parameter (`docs/generation.md`). This
records the same run with it off and on. Nothing here is a change to the code; the numbers aren't
in `../README.md`'s Baselines table.

## Baseline, 2026-11-07 (off)

Off as stated by the CEO's request and `docs/generation.md`; a run can't read the setting.

- **Commit:** `88940e3cb` (`88940e3cb+changes` on the help chat: uncommitted OpenAPI snapshots of
  other work in `services/assistant`, which its prompts and answers don't read). Two uncommitted
  lines each in `packages/common`'s audit actions and notifications, unrelated.
- **Hashes:** generation's prompts `bade19cf2c`, the assistant's `85a831d51f`; the help chat's
  knowledge 87,137 characters, sha256 `2ad27b11b6dd`, the same before and after the run.
- **Models:** generation `gpt-6.1-sol` low, help chat `gpt-6-luna` none, judge `gpt-6.1-sol` high.
- **Results** (`evals/results/`, not committed), label `textgrain-baseline-2026-11-07`:
  `test_python_backend_…json`, `reviews_results_test_python_backend_…_gpt-6.1-sol_high.json`,
  `check_code_python_backend_….txt`, `help_chat_….json`.

```bash
L=textgrain-baseline-2026-11-07
evals/run.sh generation generate_tests.py python_backend --label $L
evals/run.sh generation review_questions.py results/test_python_backend_$L.json --sample 40
evals/run.sh generation check_code.py results/test_python_backend_$L.json \
  2>&1 | tee evals/results/check_code_python_backend_$L.txt
evals/run.sh assistant help_chat.py --repeat 1 --label $L
```

| Measure | Value (95% interval) |
|---|---|
| Generation | 10 topics, 700 questions (70 multi-answer), 274 s, 8 fill-up calls |
| Tokens | 276,182 in, 148,605 out, 38,113 of them reasoning |
| Question and option length | 254 and 46 characters |
| With an example | 28% |
| Correct is longest | 22% (chance 25%); multi 44% (chance 64%) |
| Keys correct, 40 reviewed | 100.0% (91.2–100.0) |
| One defensible answer | 95.0% (83.5–98.6) |
| Clarity / relevance / distractors | 4.90 ± 0.15 / 3.88 ± 0.31 / 3.25 ± 0.29 |
| Code answers | 15 of 17 by `check_code.py`; 16 of 17 run by hand |
| Help chat, 25 answers | passed 100.0% (86.7–100.0), made up 4.0% (0.7–19.5), marker 100.0% (86.7–100.0) |
| Cost | $1.7168 generation, $0.1785 review, $1.0244 help chat ($1.0010 the judge): $2.92 |

Code answers: `python_backend-0-9` is a wrong key (marked `9`; the program ends with an uncaught
`GeneratorExit`). `python_backend-0-18` is the checker: a fragment needing `asyncio` and a
coroutine, right once wrapped. Judge's flags: `python_backend-1-1`, `python_backend-6-14`; help
chat's made-up answer: `h03`.

## After, 2026-11-07 (on)

On as stated by the CEO, for `gpt-6.1-sol` and `gpt-6-luna`. A run can't read the setting, or
show that the mark is in the text: only OpenAI's detector can
(`internal_docs/plans/delayed/text-watermark-check.md`). Nothing here proves it took effect. The
stack's services all use the `.env` key, a project key; which project the setting covers can only
be seen in the dashboard.

- **Commit:** generation `810e5c9e2`, review `41e39b8db` (a terms change between them, not read
  by generation). Generation's prompts `bade19cf2c`, the assistant's `85a831d51f`: both as the
  baseline.
- **Help chat's knowledge:** the live one had moved to 87,554 characters, `421783a61407` (the
  FAQ's, terms' and page guides' refund lines). The baseline's was rebuilt from `88940e3cb`'s
  site code with today's prices and limits, and gave the baseline's hash exactly (87,137,
  `2ad27b11b6dd`). `run.sh` from a worktree isn't enough: the eval asks the running site for the
  knowledge, so a throwaway script fed the rebuilt text into `help_chat.py`, from a worktree at
  the baseline commit (`88940e3cb+changes`), so the answers compare one to one.
- **Results** (`evals/results/`, not committed), label `textgrain-after-2026-11-07`: the same four
  files as the baseline.

| Measure | Off | On (95% interval) |
|---|---|---|
| Level the model read from the posting | hard | **medium** (see below) |
| Generation | 700 questions (70 multi), 274 s, 8 fill-up calls | 700 questions (70 multi), 179 s, 7 fill-up calls |
| Tokens in, out, reasoning | 276,182, 148,605, 38,113 | 224,738, 115,614, 21,462 |
| Question and option length | 254 and 46 | 193 and 37 |
| With an example | 28% | 27% |
| Correct is longest | 22%; multi 44% (chance 64%) | 15%; multi 50% (chance 62%) |
| Keys correct, 40 reviewed | 100.0% (91.2–100.0) | 100.0% (91.2–100.0) |
| One defensible answer | 95.0% (83.5–98.6) | 97.5% (87.1–99.6) |
| Clarity | 4.90 ± 0.15 | 4.95 ± 0.10 |
| Relevance | 3.88 ± 0.31 | 4.33 ± 0.28 |
| Distractors | 3.25 ± 0.29 | 2.80 ± 0.25 |
| Code answers by `check_code.py` | 15 of 17 | 43 of 43 |
| Help chat, 25 answers: passed | 100.0% (86.7–100.0) | 96.0% (80.5–99.3) |
| Made up / marker | 4.0% (0.7–19.5) / 100.0% | 0.0% (0.0–13.3) / 100.0% |
| Help chat's answer length, paired | 114 characters | 110 (difference −4.4, SE 7.2) |
| Cost of the run | $2.92 | $2.54: $1.3450 generation, $0.15 review, $1.0212 help chat, $0.025 the level check |

**Nothing damaged.** Checked by code on all 700 questions, on and off alike: four options each, a
right answer on each, no duplicate options or questions, every key in place, 70 multi-answer
(Structured Outputs held). Code fences all closed; 75 of 75 Python blocks parse (53 of 53 off);
all 43 runnable answers match their output. No hidden characters: no format, private-use or
unusual space characters in questions, options or help answers. Help chat's Markdown, sign-in
markers and languages are as before.

**The level is a confounder.** `extract_info` reads it from the posting on each run (the eval
skips the cache), and this time it read medium. Six more extraction calls with it on gave 4 hard, 2
medium, and two earlier runs with it off gave hard and medium, so the flip is ordinary. It
explains the shorter text, tokens, time and price: the earlier off run at medium
(`test_python_backend_reading.json`) had 197 and 32 characters and 96,226 output tokens. So those
aren't watermark effects, and the review's scores compare a medium test with a hard one.
Relevance rose and distractors fell, both overlapping the baseline's interval; distractors only
just (2.55–3.05 against 2.96–3.54), the one to look at again at the same level. Budget didn't
allow a second generation to get a hard test.

Help chat, paired by id: 9 of 25 identical. `h12` failed (two sentences where one was asked, a
known miss); `h03`'s made-up flag didn't repeat. Within the noise.

**Not measured:** Mira's answers, the Batch API (the verifier), other languages, and long help
answers (they average about 110 characters, under the 200 tokens the mark needs, so the help chat
half says little about marked text).

**Recommendation: keep it on (the CEO's setting).** Nothing worse beyond the noise, nothing
damaged, no price or speed cost seen. The eval's usual rule (no gain, so revert) doesn't decide
this: the gain sought is Art. 50(2), which it can't measure.

## Repeating the run

1. Check first: the setting covers the project of the key in the stack's `.env`, and its model
   list has both `gpt-6.1-sol` and `gpt-6-luna`. The judge is `gpt-6.1-sol` too, so its output
   is watermarked along with what it judges.
2. Run the free check below. A different knowledge hash, or a different `prompts` value in the
   results, means the prompts or knowledge moved since the baseline: run the baseline again
   before comparing.
3. Run the same commands with `L=textgrain-after-YYYY-MM-DD`.

```bash
docker exec -w /services/assistant -e PYTHONPATH=/services/assistant/src \
  -e LANGFUSE_PUBLIC_KEY= -e LANGFUSE_SECRET_KEY= testee-assistant-1 uv run --no-sync python -c '
import asyncio, hashlib
from assistant.integrations.help_knowledge import help_knowledge
k = asyncio.run(help_knowledge(None, None)).knowledge
print(len(k), hashlib.sha256(k.encode()).hexdigest()[:12])'
```

Comparing: act only on a difference beyond both intervals. Questions are written afresh, so the
review's 40 aren't the same questions and the intervals are wide: this finds a large change, not
a small one. Help chat answers pair up by id. Price, time and tokens count as well.
