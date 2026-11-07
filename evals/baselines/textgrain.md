# textGrain watermark: before and after

OpenAI's textGrain is a dashboard setting, not a request parameter (`docs/generation.md`). This
records the run made with it off, so the same run can be repeated once it is on. Nothing here
is a shipped change; the numbers aren't in `../README.md`'s Baselines table.

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

## After (on)

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
