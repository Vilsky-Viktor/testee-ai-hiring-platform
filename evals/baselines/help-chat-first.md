# Help chat baselines: the first changes

The first changes to the help chat, from 2026-10-20 to 2026-10-22; the later ones are in
`help-chat.md`.

## Help chat: a tighter rule for what the information doesn't say (2026-10-20, reverted)

Tried: "never work out a rule, a limit or a number it doesn't state from nearby facts; if the
answer isn't there, say so plainly and suggest {email} or the contact page". Passed 49 → 47 of
54 (87.0%, 75.6–93.6); the invented attempt limit (h17) 0 → 1 of 3 right; two sign-in replies
read as promising more. No gain beyond the noise: reverted. Reading the failures showed h09's
expectation was wrong: the terms do say how price changes work, and the chat quoted them, so a
right answer may do that instead of pointing to the contact page. With the case fixed, the
baseline re-run: **passed 51 of 54, 94.4% (84.9–98.1)**, made up 5.6%, markers 54/54; every
miss is h17 ("How many times can a candidate take the test?" in Japanese: it answers "once",
which the platform guide doesn't state). That gap is the guide's: it should say whether a
candidate can take a test again.

## Help chat: currencies in its guide (2026-10-21, kept)

Prices became EUR in the EU and nearby, GBP in the UK and USD elsewhere, per person and per
company. The guide gained one fact line about currencies and lost "$0 subscription"; the FAQ it
reads names prices in the visitor's currency. `help_chat.py`, `help_questions.json`, 18 messages
× 3, `gpt-6-luna` at none, same judge; both runs on the same working tree, before and after the
prompt change:

| Run | Passed | Made up | Sign-in marker | Price (help / judge) |
|---|---|---|---|---|
| Before | 88.9% (77.8–94.8) | 7.4% (2.9–17.6) | 100% | $0.013 / $1.08 |
| After | 94.4% (84.9–98.1) | 7.4% (2.9–17.6) | 100% | $0.012 / $1.06 |

No difference beyond the intervals; kept because the facts are needed for currency questions.
The failures are the known h17 (an invented retake limit) and one h04 (viewers and billing).

## Help chat: four more currencies (2026-10-21, kept)

The guide's currency line now names CAD, AUD, ILS and PLN, and the FAQ gained "Which currency
do I pay in?". Same test, dataset, model and judge as the run above: passed 94.4% (84.9–98.1),
made up 5.6% (1.9–15.1), sign-in marker 100%; $0.013 help, $1.10 judge. No difference beyond
the intervals; the only failures are the known h17 (an invented retake limit).

## Help chat: automatic top-up's pause and price notice (2026-10-21, kept)

The guide's automatic top-up line now says a declined charge is tried again after 1, 3 and 7
days, then pauses until the card's owner updates it ("Update card" on the billing page), that a
new price is emailed at least 30 days ahead, and that a currency change applies at once. Same
test, dataset, model and judge as the run above: passed 94.4% (84.9–98.1), made up 5.6%
(1.9–15.1), sign-in marker 100%; $0.013 help, $1.13 judge. No difference beyond the intervals;
the only failures are the known h17 (an invented retake limit).

## Help chat: Mira, an AI assistant that says so (2026-10-22, kept)

The help chat is the same Mira as the in-app assistant, for visitors: its instructions open "You
are Mira, testee's AI assistant" and say that asked its name, who it is or whether it's human, it
says it's Mira, an AI, never a person; its guide calls the header's button "ask Mira".
`help_questions.json` gained 6 identity questions (h19–h24: English, French, Korean, Polish,
Hebrew). Same test, model and judge, 3 repeats: before (`results/help_chat_mira-base.json`)
passed 72.2% (61.0–81.2), identity 1 of 18, the rest 51 of 54, made up 6.9%; after
(`…_mira-new2.json`) passed 94.4% (86.6–97.8), identity 18 of 18, the rest 50 of 54, made up
4.2% (1.4–11.5), sign-in marker 100% both times. A first wording that also told it to offer help
made an off-topic refusal two sentences long (h12, 1 of 3), so it was dropped. The remaining
failures are the known h17 (an invented retake limit) and one h12.

## Help chat: the reply's language chosen by code, the visitor's messages as data (2026-10-22, kept)

The help chat let the model infer the reply's language ("the page's, unless the user writes in
another"); now code chooses it (the question's own when its script or at least two of a
Latin-script language's common chat words show it, else the page's) and the prompt names it.
Each of the visitor's messages comes inside `<visitor_message>`, read as data. `help_chat.py`,
`help_questions.json`, 24 × 3, `gpt-6-luna` at none, judged by `gpt-6.1-sol` high, before →
after: passed 93.1% (84.8–97.0) → 97.2% (90.4–99.2); made up 4.2% → 2.8%; sign-in marker 100%
both; language cases 3 → 4 of 6 (the misses are h17's invented retake limit); $0.024 help, $1.27
judge. Kept: better, nothing worse.
