# Using testee responsibly: instructions for companies

Version of 2026-11-07. Arcolabs OÜ (registry code 17587452), Sepapaja tn 6, 15551 Tallinn, Estonia; hello@testee.ai.

For owners and admins of a company on testee. These are testee's instructions for use under the
EU AI Act (Art. 13). Your own duties as an employer, under the employment and data protection law
that applies to you, stay yours.

## 1. What testee is and is for

- **Provider:** Arcolabs OÜ, above. **You** (the company that tests candidates) are the deployer.
- **Intended purpose:** testing job candidates' knowledge for one role with a timed
  multiple-choice interview, to help the people at your company decide whom to take further. AI
  writes the questions from your job description (up to half of a topic may be proven questions
  from testee's own templates or its shared question bank, never ones shown publicly for practice), or
  you copy a template whose questions are already written; you review the topics (section 4); each
  candidate's answers are marked against a fixed answer key.
- **High-risk AI system.** Under the EU AI Act, a system used to evaluate candidates is high-risk
  (Annex III point 4(a)), and testee is treated as one. Its obligations apply from 2027-12-02;
  before then testee signs its EU declaration of conformity and is registered in the EU database,
  and from 2027-11-02 the CE marking is shown in the site footer, linked to the declaration.
- **Not for:** see section 11.

## 2. What a testee grade is

- The **percentage of points earned**, over every question the candidate was shown. Each question
  is worth one point:
  - most questions have one right option of four: 1 point when it's picked, 0 otherwise;
  - about 1 in 10 are **"select all that apply"** (the candidate is told to pick several): 2 or 3 of the
    4 options are right and the candidate ticks every option they think is right. Any wrong option
    ticked scores 0; otherwise the question earns the share of its right options ticked (2 of 3:
    0.67 of a point). Each candidate gets the same share of these questions.

  With single-answer questions alone, the grade is the percentage answered correctly. A question
  with nothing picked when its timer ran out counts as wrong. Candidates can change their pick
  until they move on; only the final one is kept (in voice mode, a clear spoken answer is saved at
  once and can't be changed).
- Each answer is marked against the question's **answer key**. No AI marks answers,
  and nothing else (speed, page leaves, copy attempts) changes the grade. If a question's key is
  found to be wrong and corrected, the fix applies to candidates who start after it; answers
  already given, and their grades, don't change.
- **Green or red** only compares the grade with the passing grade you set. **The ranking** sorts by
  grade, best first.
- **Explaining a grade:** the candidate's scorecard shows every question, the options picked, right
  or wrong, the points of a "select all that apply" question ("2 of 3 right options · 0.67 of 1
  point"), the time taken, and the integrity signals. That is everything the grade comes from.

## 3. Accuracy and its limits

- **Declared accuracy:** a correct answer key for **at least 98% of questions**, single-answer and
  "select all that apply" alike (for the latter, every option correctly marked right or wrong).
  Measured in testee's offline evaluations, checked by an AI judge: 99% for single-answer
  questions (240 questions in 8 fields, 2026-10-04; 98% had exactly one defensible answer) and
  98.5% for "select all that apply" questions (268 of them on 48 subtopics, 2026-10-17). The key
  checker caught 60 of 60 single-answer and 263 of 263 "select all that apply" wrong keys planted
  on purpose. Every new "select all that apply" question is also answered again blind, and dropped
  if that answer differs from its key or it leaves a deciding condition unstated. A change of
  model or prompt that misses the target isn't released without a reason.
- **What that means for a grade:** the grade counts points against the key. A key found wrong is fixed for candidates who start afterwards; grades already given are never marked again,
  so a candidate may have answered a question whose key was later corrected (section 5).
- **In use:** before an interview is ready, one answer key per topic is checked again. From about
  30 answers, a question is flagged and fixed or replaced when it is answered right by 15% or fewer, by
  95% or more (for a "select all that apply" question, by its average points), when a wrong
  option is picked more often than the key (than its least-picked right option), when strong and weak
  candidates get it right about equally often, or when time runs out on a quarter of its showings;
  also after 2 reports of the same problem.
- **What a grade is not:** a measure of overall ability, experience, potential, personality or
  fit; a qualification or certificate.
- **Not exactly comparable between candidates:** each one gets a different random set of questions
  from the same bank, so small differences (a few points) can come from the draw.
- **Not free of error:** a question can still be wrong or unclear, especially in a new interview
  before about 30 people have answered it.
- **Language and reading speed:** when the interview is timed and not in the candidate's first
  language, it also tests those. Choose the interview's language with your candidates in mind.
- **Groups of candidates:** testee collects no data about candidates' sex, age, origin or
  disability, so it can't measure results by group for you. An independent bias audit of testee
  is done before 2027-12-02 and every year after, and its summary published at testee.ai/documents.
- **Job performance:** testee doesn't learn how hired candidates do in the job, so it doesn't
  show that a grade predicts job performance.

## 4. What testee needs from you (input)

- A job description, or a description of the role, that names what the job actually needs. Only
  what is in it becomes topics.
- Your review of the topics before questions are written: uncheck what the job doesn't need,
  rename or edit, then approve. The approval is recorded. An interview your platform creates through
  the API skips this once your company has topped up: the proposed topics go on as they are, and
  no approval is recorded (until the first top-up, its topics wait for your review). An interview
  copied from a template has no topic review either. Check both on the interview's page before you
  invite anyone: exclude or regenerate a question, or set a topic's number of questions to 0 to
  drop it. An AI app or agent can approve topics too, which the action log marks.
- A passing grade and average time per question that fit the role (section 6).
- Your choice about the shared question bank: a question testee generates for your interview can
  join it once it has been answered at least 5 times and passes a filter that removes anything
  identifying you, and other companies' interviews may then use it. To keep an interview's
  questions out, use its setting; copies already reused stay.

## 5. Human review: your duty

People at your company make the hiring decision. testee never tells a candidate they were rejected.

- **Give the review to people who understand testee:** these instructions, especially sections 2,
  3 and 7, are what they need to know.
- **Before rejecting anyone on a testee result, a person must open their scorecard** and look at the
  answers, not just the grade, colour or rank.
- Use the grade **alongside** other information (CV, work samples, interviews), not as the only
  gate.
- If a question looks wrong, report it with **Wrong answer**: testee checks its answer key again,
  usually within a day, and tells you when it's fixed. Take that into account for candidates who
  already answered it.
- **Candidates can ask you for a human review** of their result (testee tells them so on the invite
  page, and reminds you on the results page and in PDF reports). Name who handles these requests,
  reply within a reasonable time, and be ready to explain what was tested and how the result was
  used.
- In the EU, a decision based solely on automated processing that significantly affects a candidate
  is restricted (GDPR Art. 22). Rejecting automatically everyone below the passing grade can be
  one.
- The same applies to results testee sends to the tools you connect: your applicant tracking
  system, Slack, or your own systems through the API and web hooks receive the grade, and your
  applicant tracking system and own systems whether it reached the passing grade. **Don't set them up to reject candidates automatically** on those
  results; the human review above applies there too.
- **The assistant and AI apps.** testee's in-app assistant acts only after the member confirms
  each change. AI apps (Claude, ChatGPT and others) a member connects act with that member's
  access, and the data they read goes to that app's provider. An agent running on a company API
  key with the `mcp` permission acts as that key, within its permissions. Owners and admins can turn AI apps
  off for the company (Integrations → AI apps → **Allow AI apps**). The same human review applies
  to results read through them. Both answer with AI and can misstate or leave out part of a
  result: before acting on what they say about a candidate, check the candidate's scorecard, and
  don't let them decide about a candidate. They don't change grades; they read what testee
  recorded.

## 6. Choosing a passing grade

- The default 70% is a starting point, not a recommendation for your role.
- Try the interview yourself first (**Try as a candidate**, free). Ask one or two people who do the
  job well to try it too: their grades show what "good" looks like.
- Set the passing grade from what the role needs, and write down why. Don't raise it to cut volume.
- Treat grades near the passing grade (for example within 5–10 points) as a band that deserves a
  closer look, not a hard cut.
- Keep the same passing grade for every candidate of the same interview.

## 7. Integrity signals

Page leaves, copy attempts and answers under 3 seconds are **hints, not proof**. A notification, an
accessibility tool, a slow connection or a fast expert can all trigger them. Page leaves and copies
are reported by the candidate's browser, and a page leave counts only when it lasts 2 seconds or
more or the candidate never came back (a shorter one, such as a notification or a permission
prompt taking focus, is kept but not counted). Never reject
on signals alone; follow up in a conversation, and let the candidate explain.

Once a candidate has finished every section, their page can also show **answer patterns**, read
from their answers and times alone (no camera, microphone, screen recording, device fingerprint or
IP address):

- **Timing:** answer times about the same on every question, instead of following each question's
  own time and its difficulty. It needs at least 8 answers given in time.
- **Unusual pattern:** hard questions right while easy ones were wrong, shown with the counts. It
  needs at least 8 questions whose difficulty is known (a question's share of right answers once
  30 candidates have answered it).

Both are set so that at most 1% of honest candidates show them in testee's tests on made-up
candidates; they catch about a third of candidates who relay every question to an AI. A pattern
can have innocent causes (a steady pace, gaps in what someone has learned, a lucky guess), so it's
a reason to ask, never proof. Patterns don't make the candidate "flagged" in the list, the ATS or
web hooks; the PDF report and the API show which patterns appeared.

For every finished candidate, the page also suggests up to 3 questions they got right to talk
through in a live interview ("Why is X right and Y not?"), from their strongest topics, and first
the hard ones behind an unusual pattern. Use them to hear the candidate's reasoning in their own
words; they appear only on the candidate's page.

## 8. Accommodations and extra time

- Tell candidates, before they start, how to ask for an accommodation (the candidate notice
  templates include this).
- testee's invite page tells candidates to ask you for more time before they start.
- For a candidate who asks, set **extra time: +25%, +50% or +100%** on every question's timer, on
  the candidate's page. It can be set or changed only **before the candidate starts**, so agree it
  first. testee stores only the amount, never the reason. Their grade is compared with the same
  passing grade.
- Candidates who come through your shareable link can't get extra time there: the page tells them
  to ask you for a personal invite first. Invite them by email instead.
- If timed multiple choice doesn't suit the candidate's needs at all (for example some screen-reader
  or motor impairments), offer an **alternative assessment** outside testee. Don't ask for medical
  details beyond what you need.
- You can also raise the average time per question for everyone in the interview's settings;
  each question's own time grows with it.
- testee's candidate pages are built to WCAG 2.2 AA.
- **Voice mode** (an interview's setting, in any of testee's 23 languages, its quality varying by
  language: testee.ai/guides/voice-interview-languages) reads each question and its options aloud and lets candidates answer aloud. It can help
  some candidates (some visual or motor impairments, a phone), but speech recognition can mishear
  an accent, a speech impairment or a noisy room: the interviewer says the option it heard and
  shows it on screen ("B, saved." for a single answer; an answer to a question with several right
  options is confirmed first), only a reply that clearly names one option is saved without asking,
  and tapping an option works at any point in the interview. A question's time runs while it's
  read. Tell candidates before they start: starting needs a working microphone, so set anyone who
  can't use one, or who prefers it, to click mode on their page before they start. testee turns
  the speech into text and options only, never stores it and never analyses the voice (no tone,
  emotion or confidence; the EU AI Act bans inferring emotions in the workplace, recruitment
  included).
- In the **UK**, the Equality Act 2010 asks you to make reasonable adjustments for disabled
  candidates; in the **US**, the ADA asks for reasonable accommodation. Extra time, an alternative
  assessment and click or voice mode are the adjustments testee gives you.

## 9. Telling candidates

Before you invite, tell candidates that they will take a timed AI-generated knowledge test, what it
covers, how the result is used, that page leaves and copies are recorded, that they confirm answering
on their own before they start, how long data is kept, and
how to ask for an accommodation, an alternative or a human review. testee's candidate notice
templates (at testee.ai/documents) are a starting point. testee's invite page also tells candidates
what to expect and links testee's privacy policy, but the notice about **your** use of the results
is yours to give.

- **People you find on the Discover tab** chose to be open to offers and gave you no data
  themselves: you got their name, LinkedIn profile and practice results from testee. Tell them, at
  the latest in your invite and within a month, who you are, why you're contacting them, what you saw and their
  rights (GDPR and UK GDPR Art. 14). Use what you see only to consider them for your own jobs, and
  remember their results are practice, not a qualification.
- Until testee has verified your company, your invite pages and emails say so in a small line.
  Use **Verify company**: your website, and a sign-in with an email on its domain.
- testee's invite and reminder emails let candidates stop your company's emails, or that
  interview's reminders, with a link at the bottom. Once a candidate stops your company's emails,
  testee doesn't email them for your company again: an invite to them shows as undelivered in the
  candidate list, so reach them another way if you still need to.
- **Candidates from your own platform.** Through the API your platform can invite a candidate with
  `sign_in` false: testee then sends them no emails, and they take the interview from their invite
  link without signing in to testee, so the notice and the link are yours to send, to that
  candidate only (anyone with the link can use it). The invite can also set a `return_url`, a
  **Back to** your company button on the finished page, and a `theme` (light, dark, or the
  candidate's own). testee's SDK (testee.ai/embed/v1.js) shows the interview inside your own page.
  The return button may lead to any https address. The embedded interview works only on the domains
  your company allows on its API page's SDK tab (localhost only when you allow it, to try it on your
  own computer); the API and web hooks don't depend on those domains: each key can be limited to
  your servers' IP addresses instead. Verification isn't
  needed for them, nor for the API or AI apps: it only adds the verified badge. The candidate still sees testee's invite page, in your company's logo and
  colors if you set them, before they start. Leaving the embedded interview, also for the rest of your page, counts
  as a page leave. The developer docs (testee.ai/api-docs) give the details.

## 10. Records, retention and data requests

**Records (logs).** For each candidate testee records every question shown and when, the picks,
right or wrong (or the points of a "select all that apply" question), the time taken, timeouts, page leaves (with how long they lasted) and copy attempts, start and finish (in voice mode, the options the candidate chose, never what they said). The
scorecard shows them, with the number of page leaves; its PDF report shows the grade, each topic's score and the signals' counts, never the questions; and the API returns the results. Answer patterns aren't
stored: they're read from these records each time the results are opened. It also records when the
candidate confirmed, before starting, that they'd answer on their own, which the scorecard shows. Your company's action
log records what your members and API keys do, for example on interviews (created, renamed, settings, shareable
link, topics approved, passing grade, notes), on candidates (invited, revoked, deleted, renamed, extra
time, mode, results viewed, reports emailed), on the team, the company, billing (refunds too) and integrations (ATS,
Slack, API keys and web hooks), with who acted, when, and whether they acted in the app, through
the assistant, an AI app, the API or an ATS. The owner reads it on the company's **Action log**
tab, filtered by member, kind of action and days, and can download it as a CSV. Keep what your law requires: the EU AI Act asks you to keep
these records at least six months, and testee keeps them for you as below. Download PDF reports to
keep them longer, and copy the scorecard's answers if your law needs those too, as the PDF holds no questions: some laws ask for more than testee's 12 months, such as California's rules on
automated-decision systems in employment (4 years, from 2025-10-01), Colorado's AI law (3 years,
from 2027-01-01) and US federal rules on hiring records (1 year from the record or the personnel action, whichever is
later, and until any charge is settled).
Team notes on an interview stay with it until you delete them or the interview, also after the
candidate they name is deleted.

**Retention.**

- Candidate results, timings and signals are **deleted automatically 12 months after the invite**
  was last sent.
- Invites never started expire after 30 days: they can't be used, and their email stays until the
  12 months above.
- Candidates your applicant tracking system sends (their email, name and ATS ids, and their result
  until it has gone back to the system) are kept 12 months.
- The action log is kept 12 months.
- Job description text is kept 90 days in generation records; the interview stays until you delete
  it.
- A candidate's request to stop your company's emails is kept, as a one-way hash of their email
  address, until you delete the company, also after you delete the candidate. A hash of an address
  that bounced or marked an email as spam stays until testee removes it, so it isn't emailed again.
- Candidates' ratings and reports of questions stay with the question, with no link to the
  candidate and without their comment once their invitation or account is deleted. Any other
  report's comment is deleted 12 months after it was written.
- Notifications in your members' bells, which can show a candidate's email and grade, are kept up
  to 90 days. A web hook still being retried holds its data about 3 days.
- Backups hold deleted data for at most 14 more days.
- PDFs you download, and results sent to your applicant tracking system, Slack or your own systems,
  are yours to keep and delete under your own retention policy.

**Data requests.** You are the controller of candidates' interview data; testee is your processor
under the data processing agreement at testee.ai/dpa, which is part of the terms.

- **Access:** open the candidate's **scorecard page** and download their **PDF report**. Together
  they show what testee keeps about the interview: each question, their answer (every option ticked), right or
  wrong or the points it earned, time taken, page leaves and copy attempts, any answer patterns, and the grade. How long each page leave lasted is kept but not shown. Send the PDF with a copy of the scorecard's answers, as the PDF holds no questions, and your own explanation of
  how it was used.
- **Erasure or objection:** on the candidate's page, revoke an unused invite, or use **Delete
  candidate** for one who started or finished: their answers and results are deleted for good, also
  from the bell and from testee's record of them for your applicant tracking system, and credits
  still held come back (a candidate who answered at least one question stays charged). Team notes
  that name them aren't touched: edit those yourself. Copies already sent to your applicant
  tracking system, Slack or your own systems are yours to delete there.
- If a candidate writes to testee instead, testee passes the request on to you.
- Candidates can also download what is linked to their own testee account with **Download my data**
  in Settings.

## 11. Where not to use testee

- As the **only** basis for a rejection without human review.
- For skills a multiple-choice knowledge test can't measure (manual, interpersonal, creative work)
  or knowledge the job doesn't actually need.
- For promotion, termination, performance monitoring or task allocation of employees.
- For candidates under 16.
- For **New York City** roles, before you have done what Local Law 144 asks of you as the employer:
  a bias audit by an independent auditor within the year before use, its summary published, and a
  notice to candidates at least 10 business days before they are assessed. testee gives you the
  bias-audit export for your auditor (the owner downloads it from the Action log page: each
  finished candidate's id and email, the interview, the day they finished, their grade, the
  passing grade, whether they passed and whether they scored above the interview's median, for
  you to add your candidates' own self-reported categories and remove the id and email before you
  share it), the summary of its own bias audit, and a notice
  template.
- Where your local law requires a works council agreement, a regulator approval or a bias audit you
  haven't done.

testee treats itself as an automated employment decision tool under Local Law 144 whenever the
grade or the passing grade is used to screen, rank or reject candidates: a numeric score that
substantially assists a hiring decision. Used only as one input among others that people weigh more,
it may not be one, but count on the duties above.

## 11a. The UK and the US

- **UK:** the UK GDPR and the Data Protection Act 2018 apply as the GDPR does: a lawful basis,
  a DPIA (the Information Commission, which still goes by ICO, treats AI in recruitment as high
  risk) and the candidate notice. A significant decision taken solely by automated means needs
  safeguards: information about it, a way to make representations, human intervention and a way
  to contest it (Arts. 22A to 22D UK GDPR, as the Data (Use and Access) Act 2025 made them from
  2026-02-05). With a person who really decides, these are good practice rather than a legal duty;
  the ICO's March 2026 report Recruitment rewired warns of calling a tool decision support when
  little human involvement remains. The ICO's recommendations for AI
  recruitment tools (2024) also ask you to check the tool's accuracy and bias with its provider,
  to collect no more than needed, and to keep candidates' data no longer than needed. Avoid
  indirect discrimination under the Equality Act 2010: choose topics and a passing grade the job
  really needs (sections 4 and 6), and watch pass rates.
- **US federal:** Title VII and the ADA apply to tests used in hiring. Check adverse impact on
  your own outcomes (the four-fifths rule of thumb in the Uniform Guidelines, 29 CFR 1607.4(D): a
  group's pass rate under 80% of the highest group's is a warning sign; the bias-audit export in
  section 11 gives the outcomes to join with your own data), and give reasonable accommodation.
  The EEOC is rescinding its copy of the Guidelines and no longer brings disparate impact cases,
  but disparate impact stays in Title VII and candidates can still sue.
- **New York City:** section 11.
- **Illinois** (Human Rights Act, from 2026-01-01): tell candidates when AI is used in
  recruitment or hiring decisions, and never use AI that discriminates by a protected class, or
  zip codes as a proxy for one (testee asks for neither). No rules on the notice have been
  adopted yet, so follow the statute. Use the Illinois notice template.
- **Colorado** (its automated decision-making law, SB 26-189, which replaced the 2024 AI Act, from
  2027-01-01; the Attorney General's rules aren't final): before using testee on Colorado
  candidates, give the pre-use notice; within 30 days of an adverse decision, explain the decision
  and testee's role, how to ask for the tool's name, version and developer and the data used and
  its sources, and the candidate's rights to correct factually wrong personal data and to ask for
  human review where commercially reasonable; keep records 3 years from the decision. Use the
  Colorado notice template; testee's documentation for deployers is this document, the technical
  facts in section 3 and the DPIA template. testee trains no AI model and puts no candidate's data
  into training: questions come from OpenAI's general-purpose models and your job description, and
  the grade comes from answer keys, not from a trained model.
- **California:** the Civil Rights Council's rules on automated-decision systems (from
  2025-10-01) make you answer for discrimination through such tools, value anti-bias testing,
  and ask you to keep their records 4 years; the privacy agency's rules on automated
  decision-making technology, for businesses under the CCPA where a tool replaces or substantially
  replaces a person's decision, ask for a pre-use notice, and access and opt-out rights (with
  exceptions for a human appeal and for tools that only assess ability to do the work), for
  significant decisions such as hiring, from 2027-01-01. A person who understands the result,
  weighs it and can change the decision keeps you outside them. testee is your service provider
  under the CCPA (the data processing agreement's US section).
- **New Jersey** (N.J.A.C. 13:16, from 2025-12-15): disparate impact rules under the Law Against
  Discrimination cover automated employment decision tools; you can be liable even if a vendor
  built the tool.
- **Texas** (HB 149, from 2026-01-01): AI used with the intent to discriminate is banned; a
  disparate impact alone doesn't show that intent.
- **Connecticut** (Public Act 26-15): since 2026-10-01 using such a tool is no defense to a
  discrimination claim, and anti-bias testing isn't required but can be taken into account. For
  tools put into use from 2027-10-01, tell applicants and employees in plain language that they are
  interacting with one, unless that's obvious, and give written notice before the decision is made:
  that you use it, its purpose and the decision, its trade name (testee), the personal data it
  analyzes and how, where the data comes from, and how to contact you. If you started using testee
  before that date, give the notice all the same: the law doesn't say how it treats a tool already
  in use. If you withhold anything as a trade secret, say so and why. Only the Attorney General
  enforces this. Use the Connecticut notice template; testee doesn't take these duties on for you,
  and the information you need is in this document and the template.

## 12. Your duties as a deployer under the EU AI Act

Already now, take measures to support the AI literacy of the staff who use testee (Art. 4), and
explain, on request, the role it played in a decision about a candidate (Art. 86: the move to 2027
leaves this article out).

From 2027-12-02, when you use testee in the EU:

- use it as these instructions say, and give human review to people with the competence and
  authority for it (section 5);
- make sure the job description and topics are relevant to the role (section 4);
- watch how it works for you, tell testee at once of a serious problem (below), and if it presents
  a risk, stop using it and tell testee and the market surveillance authority (Art. 26(5));
- keep the records for at least six months (section 10);
- tell workers' representatives and affected workers before you use it at the workplace, as your
  national rules set out (Art. 26(7));
- tell candidates that a high-risk AI system is used to assess them (section 9);
- in voice mode, rely on what testee does: speech turned into text only, never emotion
  recognition, which Art. 5 forbids in the workplace, recruitment included;
- use these instructions for your data protection impact assessment (testee's DPIA template at
  testee.ai/documents).

testee marks what its AI generates in a machine-readable way (Art. 50(2)): questions, answer options
and the assistant's answers on its pages, questions read by AI apps, and the voice clips in voice
mode made since 2026-11-07. These marks don't travel with text you copy out of testee, and a voice clip's tag can be lost
if the file is converted. Voice clips also carry OpenAI's inaudible watermark, which you can check
at openai.com/verify.

## 13. Availability, changes and support

- **What it needs:** a current web browser; candidates are best on a computer. Nothing to install.
- **Maintenance:** testee runs and updates it. During a maintenance break the site is closed and
  candidates' timers stop, so no one loses time. In an emergency testee can pause new interviews;
  candidates already in one can finish.
- **Lifetime and updates:** testee is a hosted service with no set end of life: testee maintains
  it for as long as it offers it, and updates it continuously, with nothing for you to install or
  do. A new AI model or prompt is released only after it meets the accuracy target in section 3.
  If testee ever stops offering the service, you are emailed in advance, with time to download
  your results.
- **Changes:** questions are improved continuously (section 3); a fix applies only to candidates
  who start after it. A change to how grades are worked out or to these instructions is published
  here with a new version date. A significant change to the terms or the data processing agreement
  is emailed to you at least 14 days before it applies.
- **Suspension:** a suspended company's candidates who haven't started can't start, and those in
  an interview can finish; it can't create interviews or invite anyone, also through the API, and
  its data stays readable.
- **Security:** sign-in with Google, LinkedIn or GitHub and a verified email; only the invited
  email can start an invite, except an invite your platform sent through the API without sign-in,
  which anyone with its link can use; roles limit what admins and viewers can do; API keys are kept only as
  hashes.

## Reporting serious problems

Tell testee at once at hello@testee.ai if a result may have harmed a candidate (for example a
wrong answer key behind a rejection), you see signs of unfair results for a group of
candidates, or anything looks like a security problem. testee investigates, and reports serious
incidents to the authorities when the law requires it.

Questions: hello@testee.ai.
