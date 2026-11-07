---
title: "Is AI hiring legal in the US? What employers need to know"
seoTitle: "Is AI Hiring Legal in the US? Federal and State Rules"
description: "AI in hiring is legal in the US, with rules: adverse impact and accommodation under federal law, NYC bias audits, and Illinois, Colorado and California."
updated: "2026-11-07"
---

# Is AI hiring legal in the US? What employers need to know

In general, yes: using AI in hiring is legal in the US. There is no federal AI law for hiring. Instead, federal anti-discrimination law applies to AI tools as it does to any test, and a few places add rules of their own: New York City, Illinois, Colorado, California, New Jersey, Texas and Connecticut. A December 2025 executive order set up a Justice Department task force to challenge state AI laws ([Executive Order 14365](https://www.govinfo.gov/content/pkg/FR-2025-12-16/html/2025-23092.htm)), but an order doesn't repeal them: they apply until Congress or a court says otherwise.

This guide explains the rules at a high level, the dates that matter, what employers have to do, and how testee approaches it. **It is not legal advice.** It reflects the rules as of November 2026, several of which are new or still being finalized.

## The short answer

| Question | Short answer |
| --- | --- |
| Can I use AI to screen or evaluate candidates? | Yes, within federal anti-discrimination law and state and city rules |
| Do I have to check results for bias? | Adverse impact is your responsibility; in New York City, an independent bias audit is required before use |
| Do I have to tell candidates? | In New York City and Illinois, yes; in Colorado and California, from 1 January 2027; in Connecticut, from 1 October 2027 |
| Do I have to offer extra time? | To candidates with disabilities who need it: a reasonable accommodation |
| How long must I keep records? | Four years in California, three in Colorado |
| Who makes the hiring decision? | A person. Colorado and California build in human review, and it's the safest approach everywhere |

## Federal law

### Title VII and adverse impact

Title VII of the Civil Rights Act of 1964 forbids employment discrimination because of race, color, religion, sex or national origin, including through a neutral test that has an adverse impact on a group and isn't job-related. The Uniform Guidelines on Employee Selection Procedures give the usual rule of thumb, the four-fifths rule ([29 CFR §1607.4(D)](https://www.law.cornell.edu/cfr/text/29/1607.4)):

> A selection rate for any race, sex, or ethnic group which is less than four-fifths (4/5) (or eighty percent) of the rate for the group with the highest rate will generally be regarded by the Federal enforcement agencies as evidence of adverse impact.

For example, if 60% of one group passes your test and 42% of another, the ratio is 42 ÷ 60 = 0.70, below 0.80: a warning sign to look into. It isn't proof of discrimination, and small numbers can make the ratio swing.

Federal enforcement has changed. The EEOC's 2023 technical assistance on AI in selection was taken down in January 2025. Its National Enforcement Plan of June 2026 says it will avoid disparate impact theories in investigations "to the maximum degree possible" and won't bring disparate impact cases ([EEOC](https://www.eeoc.gov/sites/default/files/2026-06/NEP_-_signed.pdf)). The Department of Labor removed its copy of the Uniform Guidelines on 26 October 2026, and on 16 October 2026 the EEOC sent the White House a final rule to rescind the interpretive parts of its own, aiming for January 2027 ([Ogletree](https://ogletree.com/insights-resources/blog-posts/eeoc-sends-oira-final-rule-rescinding-uniform-guidelines-on-employee-selection-procedures/)). Until that rule is published and takes effect, the Guidelines stay in the Code of Federal Regulations.

None of this changes Title VII. Disparate impact is in the statute ([42 U.S.C. §2000e-2(k)](https://www.law.cornell.edu/uscode/text/42/2000e-2)), candidates can still sue, and states enforce their own laws. The four-fifths rule remains a useful first check whatever happens to the Guidelines, and responsibility for adverse impact stays with the employer, whoever built the test.

### The ADA and accommodation

The Americans with Disabilities Act requires reasonable accommodation for qualified candidates with disabilities, including in tests ([29 CFR 1630.11](https://www.law.cornell.edu/cfr/text/29/1630.11)): a test should measure the skill, not the disability. Extra time is the common accommodation for a timed test. Tell candidates how to ask, before they start.

## New York City: Local Law 144

[Local Law 144](https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page), with the Department of Consumer and Worker Protection's rules (6 RCNY §5-300 and following), applies when an employer or employment agency uses an automated employment decision tool (AEDT) to substantially assist hiring decisions in the city: a job at a New York City office, at least part time, a fully remote job tied to such an office, or use by an employment agency located there. A tool that scores or ranks candidates, used to decide who moves on, very likely counts. Before using one, you need:

- **A bias audit** by an independent auditor, done within one year before use. Neither the vendor nor you, the employer, can be the independent auditor.
- **A published summary** of the audit: the selection or scoring rates and impact ratios for sex, race/ethnicity and intersectional categories, the number of candidates in an unknown category, and the tool's distribution date.
- **A notice to candidates who live in New York City** at least 10 business days before use, with information on how to ask for an alternative selection process or an accommodation.

How the audit calculates:

- **Selection rate:** the share of a category that moves forward. **Scoring rate,** for tools that give scores: the share of a category scoring above the median of the whole sample.
- **Impact ratio:** a category's rate divided by the rate of the highest category.
- Categories with less than 2% of the data may be left out of the impact ratios.
- The data must be real. The DCWP's FAQ says: "Imputed or inferred data cannot be used to conduct a bias audit." Demographic data has to come from candidates themselves, for example from a voluntary self-identification form.

## Illinois

An amendment to the Illinois Human Rights Act (Public Act 103-0804, 775 ILCS 5/2-102(L)) has applied since 1 January 2026. Employers must not:

- use AI that has the effect of discriminating against candidates or employees on the basis of a protected class;
- use zip codes as a proxy for a protected class.

And they must tell candidates when AI is used in recruitment and hiring decisions. The Illinois Department of Human Rights proposed rules on the notice in May 2026 and withdrew them in June 2026; none have been adopted yet, so follow the statute itself.

## Colorado

Colorado's AI law was repealed and re-enacted by SB 26-189, signed on 14 May 2026 and in force from 1 January 2027. The Attorney General's rules are proposed, not yet adopted as of November 2026, and due by 1 January 2027. In April 2026, in a lawsuit brought by xAI, a federal court paused enforcement of the old law and of any law replacing it until 14 days after it rules on xAI's request for an injunction, a request that waits for those rules. The January date itself hasn't changed. For deployers of automated decision-making technology that materially influences an employment decision, the duties are:

- **Notice before use** to the candidate.
- **An explanation of an adverse decision,** such as not being hired or not moving forward.
- **Correction and review:** a way to correct data and to ask for a human review.
- **Records,** kept for 3 years.

## California

- **Civil Rights Council regulations on automated-decision systems,** in force since 1 October 2025: anti-discrimination law applies to automated tools in hiring as it does to any other selection method. Employers must keep employment records, including automated-decision system data, for four years (Cal. Code Regs. tit. 2, §11013(c)).
- **The CCPA's rules on automated decision-making technology** apply to employment decisions from 1 January 2027: a notice before use, the right to opt out or to appeal, and the right to access information about how the technology was used.
- **The No Robo Bosses Act (SB 947),** signed on 30 September 2026, applies from 1 July 2027 to discipline and termination, not to hiring.

## New Jersey and Texas

- **New Jersey.** Rules on disparate impact under the Law Against Discrimination (N.J.A.C. 13:16), in force since 15 December 2025, name automated employment decision tools among the practices that may have a disparate impact. An employer that relies on a vendor's product must take reasonable steps to make sure it is consistent with the law, and a tool not adequately tested before use may itself have a disparate impact.
- **Texas.** The Responsible AI Governance Act (HB 149), in force since 1 January 2026, bans AI used with the intent to discriminate unlawfully. A disparate impact alone doesn't show that intent.

## Connecticut

Public Act 26-15 (SB 5), signed in May 2026, has two parts for employers:

- **Since 1 October 2026:** using an automated employment decision tool is no defense to a discrimination claim. Anti-bias testing isn't required, but evidence of it can be taken into account.
- **From 1 October 2027:** tell candidates in plain language when they're interacting with such a tool, unless it's obvious, and give written notice before using it for a decision: that it's used, its purpose and the kind of decision, its trade name, the personal data it analyzes and how, where the data comes from, and how to contact you.

## The dates

| Date | What applies |
| --- | --- |
| 5 July 2023 | New York City's Local Law 144 enforced |
| 1 October 2025 | California's Civil Rights Council rules on automated-decision systems |
| 15 December 2025 | New Jersey's rules on disparate impact |
| 1 January 2026 | Illinois: notice of AI use, no discriminatory AI, no zip codes as a proxy; Texas: no AI used with intent to discriminate |
| 1 October 2026 | Connecticut: an automated tool is no defense to a discrimination claim |
| 1 January 2027 | Colorado's AI law; California's CCPA rules on automated decision-making in employment |
| 1 October 2027 | Connecticut: notice to candidates |

## A practical checklist for employers

1. **List the jobs and places** you hire for: New York City, Illinois, Colorado, California, New Jersey, Texas, Connecticut, elsewhere in the US.
2. **Test only what the job needs.** Choose topics and a passing grade you can justify for the role.
3. **Update your candidate notice** to say AI is used, how results are used, and how to ask for an accommodation and a human review. Add the Illinois and Colorado wording where they apply.
4. **Offer accommodations,** such as extra time, and agree them before the candidate starts.
5. **Collect demographic data from candidates themselves,** on a voluntary self-identification form, kept apart from hiring decisions. Never infer it.
6. **Check adverse impact** on your own outcomes, with the four-fifths rule as a first check.
7. **For New York City jobs,** commission an independent bias audit, publish its summary and give the 10-business-day notice before you use the tool.
8. **Keep records as long as your law requires,** for example four years in California and three in Colorado.
9. **Never reject on a score alone.** Have a person review each result.

## How testee approaches this

testee runs timed multiple-choice skills interviews written by AI from a job description. Its approach in the US is the same as in the EU. testee does not claim to be compliant or certified.

What that looks like in the product today:

- **AI writes the questions and their answer keys; marking follows fixed rules.** No AI judges a candidate's answer, and no video or face analysis is used. In voice mode, speech is turned into text and matched to an option, which is said back to the candidate and shown on screen: one clearly named option is saved at once, and a choice of several options is confirmed first. testee never stores speech, and the voice is never analysed.
- **You approve the topics** before any question is written, and you choose the passing grade. The exception is an interview your own platform creates through the API once your company has topped up: it goes straight on from the proposed topics.
- **People decide.** testee doesn't reject candidates or send rejection messages.
- **No protected characteristics.** testee never asks for, infers or stores candidates' sex, race, age, disability, zip code or other protected characteristics.
- **A bias-audit export.** On the company's Action log page, the owner can download a CSV file of the candidates who finished, for the whole company or one interview and between two dates: each candidate's grade, the passing grade, whether they passed and whether they scored above the interview's median. Each row is keyed by the candidate's email, so you can join it with the self-reported categories you collected yourself; then remove the email column and give the file to your independent auditor, who works out the selection and scoring rates and the impact ratios. The same file lets you run the four-fifths check yourself.
- **Extra time** of +25%, +50% or +100% on every question can be given to any candidate who asks, before they start. testee stores only the amount, never the reason. In voice mode, a candidate can tap an option instead of speaking. Starting a voice interview needs a microphone, so before they start, set a candidate who can't use one to answering by tapping. You can also set the whole interview to that.
- **Candidate notice templates,** a general one and versions for New York City, Illinois and Colorado, are on the [documents page](/documents), with the instructions for companies.
- **New York City.** testee hasn't had its own independent bias audit yet. Don't use testee for New York City jobs until you've done what Local Law 144 asks of you as the employer: an independent bias audit within the year before use, its summary published, and a notice to candidates 10 business days before.
- **Data.** Your company is the business and testee its service provider under the CCPA, under the [data processing agreement](/dpa) and its US section. Data is hosted in the EU, with some sub-processors in the US (see the [privacy policy](/privacy)), and isn't used to train AI models.
- **Retention.** Candidate data is deleted 12 months after the invite. Where your law asks you to keep records longer, such as California's four years, download the PDF reports and the bias-audit file and keep them yourself; testee doesn't keep results longer by default.

## Related reading

- [Is AI hiring legal in the EU?](/guides/is-ai-hiring-legal-in-the-eu)
- [Is AI hiring legal in the UK?](/guides/is-ai-hiring-legal-in-the-uk)
- [How to time a skills test: question timers, length and extra time](/guides/skills-test-timing-and-extra-time)
- [Pre-employment testing: a practical guide](/guides/pre-employment-testing)

## Sources

- Uniform Guidelines on Employee Selection Procedures, [29 CFR §1607.4(D)](https://www.law.cornell.edu/cfr/text/29/1607.4).
- Title VII of the Civil Rights Act of 1964, [42 U.S.C. §2000e-2(k)](https://www.law.cornell.edu/uscode/text/42/2000e-2).
- EEOC, [National Enforcement Plan](https://www.eeoc.gov/sites/default/files/2026-06/NEP_-_signed.pdf), June 2026; Ogletree, [EEOC sends OIRA final rule rescinding the Uniform Guidelines](https://ogletree.com/insights-resources/blog-posts/eeoc-sends-oira-final-rule-rescinding-uniform-guidelines-on-employee-selection-procedures/), October 2026.
- [Executive Order 14365](https://www.govinfo.gov/content/pkg/FR-2025-12-16/html/2025-23092.htm), 11 December 2025.
- Regulations to implement the equal employment provisions of the Americans with Disabilities Act, [29 CFR 1630.11](https://www.law.cornell.edu/cfr/text/29/1630.11).
- New York City Local Law 144 of 2021 and 6 RCNY §5-300 and following; DCWP, [Automated Employment Decision Tools](https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page) and its FAQ.
- Illinois Human Rights Act, 775 ILCS 5/2-102(L), as amended by Public Act 103-0804.
- Colorado SB 26-189; *xAI v. Weiser* (D. Colo., No. 1:26-cv-01515), [stay of 27 April 2026](https://www.mcdermottlaw.com/insights/colorado-ai-law-in-flux-comprehensive-replacement-bill-signed-after-federal-court-blocks-predecessors-enforcement/).
- California Code of Regulations, title 2, §11013(c); California Consumer Privacy Act regulations on automated decision-making technology; [SB 947](https://www.morganlewis.com/pubs/2026/10/california-enacts-new-laws-governing-employer-use-of-ai).
- New Jersey, [N.J.A.C. 13:16](https://www.jacksonlewis.com/sites/default/files/2026-02/N.J.A.C.-13-16-Disparate-Impact-Discrimination.pdf) (§13:16-2.4(e) on vendors, §13:16-3.2(c) on automated tools), with [Morgan Lewis's summary](https://www.morganlewis.com/pubs/2025/12/new-jersey-codifies-existing-disparate-impact-rules).
- Texas, [HB 149](https://davispolk.com/insights/client-update/texas-governor-signs-responsible-ai-governance-act).
- Connecticut Public Act 26-15, as summarized by [Cooley](https://cooley.com/news/insight/2026/2026-11-03-connecticuts-ai-rules-take-shape-what-employers-and-developers-need-to-know), November 2026.
