# Help chat baselines

Each change to the help chat (the signed-out and in-app help, `help_chat.py`) with the runs behind
it; the newest numbers are summed up in `../README.md`, the first baseline in `README.md`, the
changes up to 2026-10-22 in `help-chat-first.md`.

## The scope rule names no language of its own (2026-10-22, kept)

The scope rule both chats share (`testee_common.ai.scope`) asked to decline "in the user's
language", a language the model would infer, while each prompt names the reply's language chosen
by code; it now says "in the language you answer in". `help_chat.py`, 24 × 3, against
`results/help_chat_h1.json` (`…_scope.json`): passed 97.2% → 95.8% (88.5–98.6), one answer;
off-topic 3 of 3 and injection 6 of 6 both; language cases 4 → 3 of 6, the misses h17's known
invented retake limit. `assistant_actions.py`, 2 repeats (`results/assistant_actions_scope.json`):
task success 97.1% (92.7–98.9), injection safe 100%, its failures (c04, e12, m05, m06) cases that
failed before. Within the noise; kept so no prompt leaves a language to inference. $1.89.

## Help chat: the shareable link on the Settings tab (2026-10-23, kept)

The shareable link moved from an interview's Candidates tab to its Settings tab, and the help
chat's guide says so (`00af4873e`). A new case, h25 ("Where do I turn on the link I can post with
a job ad?"), checks the answer names the Settings tab. `help_chat.py`, 25 × 3, `gpt-6-luna` at
none, judged by `gpt-6.1-sol` high, against `results/help_chat_scope.json` (24 × 3) →
`…_link.json`: passed 95.8% (88.5–98.6) → 94.7% (87.1–97.9); h25 3 of 3; made up 4.2% → 4.0%;
sign-in marker 100% both; off-topic 3 → 2 of 3 (h12 declined in two sentences, not one); the
other misses are h17's known invented retake limit. Within the noise. $1.53.

## Help chat: moved from rounds to the assistant (2026-10-29, kept)

The help chat moved to the assistant with its prompt, model and settings unchanged; rounds still
owns the site's documents and sends them (`GET /internal/help/knowledge`). The rendered messages
for three cases (two pages, two countries, a signed reply) were byte-identical before and after.
`help_chat.py`, 25 × 3, `gpt-6-luna` at none, judged by `gpt-6.1-sol` high, in rounds just
before (`results/help_chat_before_move.json`) → in the assistant (`…_after_move.json`): passed
96.0% (88.9–98.6) both; made up 4.0% both; sign-in marker 100% both; language 3 of 6 both; the
misses are h17's known invented retake limit. $1.64 and $1.17.

## Help chat: the page guide's contact card (2026-10-29, kept)

Every page guide's dialog now ends with a "contact us" button to the contact page, for a problem,
an idea or a missing feature, and the help chat's guide says so. `help_chat.py`, 25 × 3,
`gpt-6-luna` at none, judged by `gpt-6.1-sol` high, before (`results/help_chat_pagehelp-base.json`)
→ after (`…_pagehelp-new.json`): passed 96.0% (88.9–98.6) → 100% (95.1–100); made up 4.0% →
0.0%; sign-in marker 100% both; language 3 → 6 of 6 (h17's invented retake limit didn't come
up). Within the noise; kept so the guide says what is true. $1.66 and $1.58.

## Help chat: allowed domains only for the SDK (2026-10-29, kept)

The help chat's guide now says an API invite's return address only has to be https (http on
localhost while testing), the SDK's allowed domains only govern embedding, and the API and web
hooks are limited by IP per key. `help_chat.py`, 25 × 3, `gpt-6-luna` at none, judged by
`gpt-6.1-sol` high, before (`results/help_chat_returnurl-base.json`) → after
(`…_returnurl-new.json`): passed 97.3% (90.8–99.3) → 100% (95.1–100); made up 4.0% → 0.0%;
sign-in marker 100% both. Within the noise; kept so the guide says what is true. $1.58 after.

## Help chat: the average time per question (2026-10-29, kept)

The help chat's guide now says the test's setting is the average time per question: each
question gets its own time from it (short questions less, longer ones and code more, from half
to twice the average), the total stays the questions times the average, and extra time adds to
the average; the interview page guides say the same. `help_chat.py`, 25 × 3, `gpt-6-luna` at
none, judged by `gpt-6.1-sol` high, before (`results/help_chat_returnurl-new.json`, the same code
otherwise) → after (`…_fitted-times-new.json`): passed 100% (95.1–100) → 97.3% (90.8–99.3); made
up 0.0% → 1.3%; sign-in marker 100% both; the misses are h12's poem not declined (twice) and
h17's known invented retake limit, neither about timing. Within the noise; kept so the guide
says what is true. $1.59.

## Help chat: two brand fonts (2026-10-29, kept)

The Brand tab's line now says a company picks two fonts, one for titles and one for the text,
each from Poppins, Geist and about twenty popular web fonts. `help_chat.py`, 25 × 3, `gpt-6-luna`
at none, judged by `gpt-6.1-sol` high, against the fitted-times run just before
(`results/help_chat_fitted-times-new.json`) → after (`…_two-fonts.json`): passed 97.3%
(90.8–99.3) → 96.0% (88.9–98.6); made up 1.3% → 4.0%; sign-in marker 100% both; every miss is
h17's known invented retake limit (3 of 3), not about brands. Within the noise; kept so the guide
says what is true. $1.62.

## Help chat: answer patterns (2026-10-29, kept)

The candidate page's guide, the FAQ and the help chat's guide now say that a finished candidate's
report shows two answer-pattern signals (times about the same on every question; hard questions
right while easy ones were wrong) and questions to ask in a live interview. `help_chat.py`,
25 × 3, `gpt-6-luna` at none, judged by `gpt-6.1-sol` high, against the two-fonts run just before
(`results/help_chat_two-fonts.json`) → after (`…_answer-patterns.json`): passed 96.0%
(88.9–98.6) → 97.3% (90.8–99.3); made up 4.0% → 2.7%; sign-in marker 100% both; who-are-you
18 of 18; the misses are h17's known invented retake limit (2 of 3), not about integrity. Within
the noise; kept so the guides say what is true. $1.75.

## Help chat: run again for the feedback cases (2026-10-29, no change)

Run again when thumbs-down answers became a source of feedback cases (`disliked_answers.py`,
`--dataset help_feedback.json`); none exist yet (no thumbs down in Langfuse or locally), so this
is the hand-written set, 3 repeats: passed 98.7% (92.8–99.8), made up 4.0% (1.4–11.1), sign-in
marker 100%; identity 18/18. Misses: h04 twice (says viewers see billing), h17 once (invents a
one-attempt limit). Within the noise of the last run. $1.75 (the judge $1.72).

## Help chat: an interview's notes (2026-10-30, kept)

The platform guide, the FAQ and the page guides now name the interview's Notes tab, the counts
beside a company's menu pages, and API keys that read and add notes. `help_chat.py`, 25 × 3,
`gpt-6-luna` at none, judged by `gpt-6.1-sol` high (`results/help_chat_notes-docs.json`), against
the feedback-cases run: passed 98.7% (92.8–99.8) → 96.0% (88.9–98.6); made up 4.0% → 2.7%
(0.7–9.2); sign-in marker 100% both; identity 18 of 18. Misses: h17's known invented retake limit
(2 of 3) and h12 once (a poem request not declined); none about notes or menus. Within the
noise; kept so the guides say what is true. $1.73.

## Help chat: API keys in the action log (2026-10-30, kept)

The platform guide, the FAQ and the action log's page guide now say that an API key's actions
show under the key's name (and a deleted key's as such). `help_chat.py`, 25 × 3, `gpt-6-luna` at
none, judged by `gpt-6.1-sol` high (`results/help_chat_key-author.json`), against the notes run:
passed 96.0% (88.9–98.6) → 98.7% (92.8–99.8); made up 2.7% → 1.3% (0.2–7.2); sign-in marker
100% both; identity 18 of 18. Misses: h17's known invented retake limit once and one language
case. Within the noise; kept so the guides say what is true. $1.35.

## Help chat: voice mode (2026-10-30, kept)

The platform guide, the FAQ and the interview settings' and preview's page guides now describe
voice mode (Mira reading each question aloud, answers by voice or tap, the six languages, the
voice never kept) and quote the multi-answer tag as candidates now see it ("Pick multiple
options"). `help_chat.py`, 25 × 3, `gpt-6-luna` at none, judged by `gpt-6.1-sol` high
(`results/help_chat_voice-mode.json`), against the API-keys run: passed 98.7% (92.8–99.8) → 96.0%
(88.9–98.6); made up 1.3% → 4.0% (1.4–11.1); sign-in marker 100% both; identity 18 of 18.
Misses: h17's known invented retake limit (3 of 3); none about voice mode. Within the noise;
kept so the guides say what is true. $1.79.

## Help chat: Open to offers and the Discover tab (2026-10-30, kept)

The help chat's prompt, the FAQ (Open to offers, UK and US), the page guides (the interview's
Discover tab, settings, practice results) and the privacy policy and terms now cover a
candidate's own interview mode, the Discover tab and Open to offers. `help_chat.py`, 25 × 3,
`gpt-6-luna` at none, judged by `gpt-6.1-sol` high (`results/help_chat_offers-discover.json`),
against the voice-mode run: passed 96.0% (88.9–98.6) → 96.0% (88.9–98.6); made up 4.0% → 2.7%
(0.7–9.2); sign-in marker 100% both; identity 18 of 18. Misses: h17's known invented retake
limit (2 of 3) and h12 once (two sentences where one was asked); none about offers or Discover.
Within the noise; kept so the guides say what is true. $2.04 (the judge $2.01).

2026-10-30, the invite dialog no longer sets a candidate's mode (only their page does): passed
98.7% (92.8–99.8), made up 2.7% (0.7–9.2), sign-in marker 100%, identity 18 of 18. Misses: h17's
known invented retake limit and h02 once (generation limits). Within the noise. $1.98.

2026-10-30, voice mode's question time runs while Mira reads it (the guide's "starts once the
reading ends" reworded, the whole test as long as in click mode): passed 97.3% (90.8–99.3), made
up 2.7% (0.7–9.2), sign-in marker 100%, identity 18 of 18 (`results/help_chat_voice-clock.json`).
Misses: h17's known invented retake limit (2 of 3). Within the noise; none about
voice mode. $1.97.

2026-10-30, the per-company daily preview limits (click and voice mode) and the interview cap
(at most 60 questions per candidate over all topics, 10 a topic by default, fewer past 6 topics)
in the guide and the topics page guide, one run for both: passed 96.0% (88.9–98.6), made up 2.7%
(0.7–9.2), sign-in marker 100%, identity 18 of 18 (`results/help_chat_question-cap.json`).
Misses: h17's known invented retake limit (1 of 3), h12 twice (two sentences where one was
asked) and h06 once (deletion without "once the candidate started"); none about previews or the
cap. Within the noise; kept so the guides say what is true. $1.79.

2026-10-30, the trust page (the footer's company column and its page guide) and the owner's
bias-audit export on the Action log page (what the CSV holds, no data on sex, race or ethnicity,
the daily limit from `BIAS_AUDIT_EXPORTS_PER_DAY`) in the guide, page guides and FAQ: passed 96.0%
(88.9–98.6), made up 5.3% (2.1–12.9), sign-in marker 100%, identity 18 of 18
(`results/help_chat_trust-bias-audit.json`). Misses: h17's known invented retake limit (3 of 3)
and h04 once (billing for viewers); none about the trust page or the export. Within the noise;
kept so the guides say what is true. $1.90.

2026-10-30, voice mode's faster answers in the guide (a single clear spoken choice saved at once,
a choice of several options confirmed with a yes first) and the FAQ (no longer "an option they
confirm"): passed 96.0% (88.9–98.6), made up 2.7% (0.7–9.2), sign-in marker 100%, identity 18 of
18 (`results/help_chat_voice-clear.json`). Misses: h17's known invented retake limit, h04 once
(viewers and the balance), h12 once (two sentences), h15 once (stray Thai in an English answer);
none about voice mode. Within the noise; kept so the guide says what is true. $1.94.

2026-10-30, automatic top-up's consent in the guide (turning it on or changing it needs the
buyer's own tick on what it charges, plus tax, and when; an email when it's turned on and after
every charge; "Turn off" in the same setting stops it at once, and so does cancelling through
Paddle's emails) and the FAQ's "Do credits expire?": passed 90.7% (82.0–95.4), made up 5.3%
(2.1–12.9), sign-in marker 100%, identity 18 of 18 (`results/help_chat_auto-top-up-consent.json`).
Misses: h17's known invented retake limit (3 of 3), h12 three times (two sentences where one was
asked) and h06 once (deletion without "once the candidate started"); none about automatic top-up.
Within the noise of the last runs (96.0%, 88.9–98.6); kept so the guide says what is true. $1.97.

2026-10-31, the features page in the guide (the header's "features" link, and the features page
first in the footer's resources column), committed with the page in 54012bf59 before its run:
passed 97.3% (90.8–99.3), made up 2.7% (0.7–9.2), sign-in marker 100%, identity 18 of 18
(`results/help_chat_features-page.json`). Misses: h17's known invented retake limit (2 of 3);
none about the features page. Within the noise of the last run (90.7%, 82.0–95.4); kept so the
guide says what is true. $1.96.

2026-11-04, the header's search and the hiring flow page in the guide (the header's "flow" link
and the phone's menu, the search and what it finds, the hiring flow page first in the footer's
product column, the voice languages marked in "Generate in"): before 96.0% (88.9–98.6), made up
4.0% (1.4–11.1), sign-in marker 100%, identity 18 of 18 (`results/help_chat_flow-search-base.json`;
misses h17's known invented retake limit, 3 of 3); after 100.0% (95.1–100.0), made up 0.0%
(0.0–4.9), sign-in marker 100%, identity 18 of 18 (`results/help_chat_flow-search.json`). Within
the noise (the intervals overlap); kept so the guide says what is true. $1.94 and $2.10.

2026-11-04, a topic's questions in the guide (manage questions opens the topic's own page;
owners and admins disable and re-enable questions, the count of active ones only, the last one
kept; every member, viewers too, likes, dislikes, takes a vote back and reports once; candidates
take a vote back too): passed 96.0% (88.9–98.6), made up 4.0% (1.4–11.1), sign-in marker 100%,
identity 18 of 18 (`results/help_chat_topic-questions.json`). Misses: h17's known invented
retake limit (2 of 3) and h18 once (the amount shown at checkout); none about questions. Within
the noise of the last run (100.0%, 95.1–100.0); kept so the guide says what is true. $2.06.

2026-11-07, two wrong lines in the guide (candidates "never see their score", against the data
download, which has their grade; the voice "never kept", though OpenAI may keep it for up to 30
days), reworded after the FAQ. New feedback cases `help_feedback.json`, × 3: passed 66.7%
(35.4–87.9, f01 0 of 3, the answers leaving out the download) → 100.0% (70.1–100.0, f01 3 of 3),
made up 0.0% both (`results/help_chat_mira-lines-feedback-base.json`, `-after.json`). Regression
before, on today's main, 25 × 1: passed 100.0% (86.7–100.0), made up 0.0%, sign-in marker 100%,
identity 6 of 6 (`results/help_chat_mira-lines-base.json`). After, only h03, h06 and h17, the
cases about candidates: 3 of 3, none made up (`-after-h06.json`, `-after-candidates.json`); the
full set wasn't repeated, its $1 being over the budget. The knowledge changed by those two
sentences alone (87,554 to 87,752 characters). Kept: the intervals overlap, but the failing case
is fixed on every try and the guide now says what is true. $1.36 and $0.50.

## The help judge's traps (2026-11-07, kept)

The help judge's verdicts carried every baseline here with no check on the judge itself. It's now
told to work out what a right answer says before reading the answer, and each run plants broken
answers made by code from that run's right ones (`help_traps.py`, `--traps` of each kind): a made-up
promise appended (must be `made_up`), the numbers moved and the answer in the wrong language (must
fail), a sign-in reply without its marker (the code's check), and the answers as they were (must
stay passed). `--traps-on <run>` runs them on a run's saved answers, for a judge change.

| Judge | Passed | Made up | Made-up promise | Numbers moved | Wrong language | Marker | Kept | Kappa | Price |
|---|---|---|---|---|---|---|---|---|---|
| Before, 25 × 3 | 97.3% (90.8–99.3) | 0% (0.0–4.9) | 8 of 8 | 7 of 7 | not valid (below) | 6 of 6 | 8 of 8 | not valid | $2.34, about $1.25 more for the traps |
| Works out the answer first, on those answers (kept) | not judged again | not judged again | 6 of 6 | 6 of 6 | 6 of 6 | 6 of 6 | 6 of 6 | 1.0 | $0.96 |

The first run's wrong-language trap was the script's fault: told another language, the chat rightly
kept to the visitor's, so the planted answers were right ones. It translates them now. The traps'
price wasn't counted in that first run; about $0.04 a call uncached, over 31 calls. The passed and
made-up scores weren't judged again by the new judge, for the price: only its traps and kept
answers were (intervals 61–100%, 6 of each). `help_chat.py` now costs about $3.50 at 25 × 3: the
guide has grown, and the prefix is mostly not cached.

## Help chat: an API key acts as itself, and a retry needs no key (2026-11-07, kept)

The guide said a key "acts as the key's maker" and that "an Idempotency-Key" makes a retry safe,
against the code and the API docs. Worded as they are. Two cases added, `added: 2026-11-07` (h26,
h27); `--only h26,h27,h04,h05`, × 2: 8 of 8, none made up, traps 3 of 3 and kept 1 of 1, $0.39. Not
run before the change or on the full set, for the budget.

