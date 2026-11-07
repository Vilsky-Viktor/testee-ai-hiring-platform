# The FAQ in en; the {placeholders} are filled in by helpers/help.py (faq_values) with
# billing's prices and the number of languages.
FAQ = [
    {
        "key": "what",
        "question": "What is testee?",
        "answer": "A timed multiple-choice interview made from your job description, for any role. Use it to screen candidates before you meet them, or as a hiring step itself: either way, you see who really knows the job.",
    },
    {
        "key": "roles",
        "question": "Which roles can I hire for?",
        "answer": "Any role where knowledge matters: support, sales, finance, healthcare, trades, engineering, marketing and more. If you can describe the job, testee can build an interview for it.",
    },
    {
        "key": "hiring",
        "question": "How does it work?",
        "answer": "Paste a job description on the home page, name your company and check the topics testee proposes. Then invite candidates: type their emails, paste a list or upload a file. Candidates who haven't started after a few days get one reminder. Each candidate gets their own questions and a timer on each one, and you see their score and every answer as soon as they finish.",
    },
    {
        "key": "templates",
        "question": "Can I start from a ready-made interview?",
        "answer": "Yes. Your company's Templates tab lists ready-made interviews by role, which you can search and filter by level and language. Owners and admins can copy one into the company at once, free, and then change it like any interview; candidates are charged as usual.",
    },
    {
        "key": "link",
        "question": "Can I put an interview in a job ad?",
        "answer": "Yes. Turn on the interview's shareable link on its settings tab and paste it into your ad. Anyone who opens it signs in and takes the interview, and each person is charged like an invited candidate. With no credits left, the link takes no new people. The link turns off when you mark the interview as hired.",
    },
    {
        "key": "preview",
        "question": "Can I try an interview before inviting anyone?",
        "answer": "Yes. Open your interview as a candidate from its page, free of charge: previews don't appear among your candidates or in question statistics. You can also take any of the free practice interviews.",
    },
    {
        "key": "question_quality",
        "question": "How do you check that the questions are right?",
        "answer": "Before an interview is ready, a second AI checks a sample of its answer keys. After that, answers, votes and reports flag weak questions, which are corrected or replaced in the background for candidates who start afterwards; grades already given don't change. On a topic's page you can read every question, and owners and admins can disable one, regenerate it or mark its answer as wrong.",
    },
    {
        "key": "open-to-offers",
        "question": "Can companies find me through my practice?",
        "answer": "Only if you choose to. Turn on Open to offers after a practice round or in Settings, with your LinkedIn profile's address. Companies that have topped up on testee then see your name, LinkedIn profile and latest timed practice result on each subject of their interviews that you practised, and may invite you to an interview. testee doesn't rank or recommend you. Turn it off at any time in Settings, and you disappear from every company's list at once; it also ends a year after you last turned it on or saved your LinkedIn profile.",
    },
    {
        "key": "cheating",
        "question": "Can candidates use AI or look up the answers?",
        "answer": "Each candidate gets questions drawn at random from every topic, in their own order, with [a timer on each question](/guides/skills-test-timing-and-extra-time) that our server keeps, so there's little time to look answers up or ask an AI. The scorecard also shows when a candidate left the page, copied text, or answered too fast to have read the question. Once they finish, their page also points out answer patterns that relaying questions to an AI tends to leave, such as about the same time on every question or hard questions right while easy ones were wrong, and suggests questions they got right to ask about in a live interview. A pattern is a reason to ask, not proof. Before starting, each candidate also confirms they'll answer on their own, without AI tools or other people, and their scorecard shows it.",
    },
    {
        "key": "practice",
        "question": "Can I practise for free?",
        "answer": "Yes. The [practice page](/practice) has free interviews by role: sign in, choose standard time, double time or no time limit, and see your grade and every right answer at the end. Your practice is private; companies see a result only if you turn on Open to offers.",
    },
    {
        "key": "voice",
        "question": "Can candidates answer by voice?",
        "answer": "Yes, if the company sets an interview to voice mode, in any of testee's 23 languages; how well it reads and hears varies by language (the guide \"Voice interviews in 23 languages\" shows each). The questions are read aloud and candidates answer aloud; what they say is turned into text and matched to an option. testee doesn't store it; OpenAI, which does this for us, may keep it for up to 30 days, only to check for abuse unless the law requires longer. Voices aren't analysed for tone or emotion, and candidates can always tap instead.",
    },
    {
        "key": "extra_time",
        "question": "Can a candidate get extra time?",
        "answer": "Yes. Before a candidate starts, owners and admins can give them 25%, 50% or 100% more time on each question, on the candidate's page; no reason is recorded. Someone using a shareable link asks the company for a personal invite first. See [how to time a skills test](/guides/skills-test-timing-and-extra-time).",
    },
    {
        "key": "retake",
        "question": "Can a candidate retake an interview or go back?",
        "answer": "No. An interview is taken once, in a single pass: a candidate can change their pick until they press Next question, and then it's final. Once they've finished, they can't be invited to that interview again.",
    },
    {
        "key": "connection",
        "question": "What if a candidate's connection drops or they close the page?",
        "answer": "They open the same link and carry on. Our server's clock keeps running meanwhile: a question whose time runs out while they're away counts as wrong, and the next question's timer starts when it's shown. An interview left unfinished ends by itself once its total time, plus 10%, has passed.",
    },
    {
        "key": "cost",
        "question": "How much does it cost?",
        "answer": "Generating interviews is free. Each candidate who answers at least one question costs {candidate} credits ({candidate_price}), and less with credits from larger top-ups, down to {cheapest_price}. Your first company gets {company} free credits, enough for its first {company_candidates} candidates. Prices don't include VAT or sales tax. The [pricing page](/pricing) lists every price.",
    },
    {
        "key": "charged",
        "question": "When is a candidate charged?",
        "answer": "Once they've answered at least one question: when their interview ends (they finish it, or its time runs out while they're away), or when you revoke them, which also erases their answers for good. A question whose time ran out with no answer picked doesn't count. Their credits are set aside when you invite them (through a link, when they start), and come back if you revoke them before they answer anything, if they never start and the invite expires after 30 days, or if their interview ends with nothing answered.",
    },
    {
        "key": "compare_hiring",
        "question": "How does the price compare with other assessment tools?",
        "answer": "Many assessment tools are sold as monthly or annual subscriptions, paid whether or not you test anyone. With testee you pay only per candidate, with credits bought up front: {candidate} credits ({candidate_price}), with no contract, no seat fees and nothing to pay for generating an interview. A company inviting {example_candidates} candidates a month pays about {example_year_price} a year before tax. If you test many candidates every month, a subscription can cost less, so compare with your own numbers.",
    },
    {
        "key": "top_up",
        "question": "How do I buy credits?",
        "answer": "Owners and admins top up on the top-up page, in the account menu, for {min_candidates} to {max_candidates} candidates at a time. Paddle takes the payment, adds any VAT or sales tax and issues the receipt or invoice; each top-up's invoice is also on the company's Billing tab.",
    },
    {
        "key": "expire",
        "question": "Do credits expire?",
        "answer": "No. Credits never expire, and there are no paid subscriptions. If you turn on the optional automatic top-up, Paddle saves your card as a {zero_price} subscription; you pay only for the top-ups it makes.",
    },
    {
        "key": "auto_top_up",
        "question": "Can credits top up automatically?",
        "answer": "Yes, if an owner or admin turns it on, on the top-up page: choose a top-up and the balance to refill under, and tick what it charges and when. Each time the company's available balance falls under that level, the saved card is charged, plus any tax, and the company's owners and admins get an email. A declined charge is tried again after 1, 3 and 7 days; then automatic top-up pauses until the card is updated. Turning it off, where you turned it on, stops it at once.",
    },
    {
        "key": "currency",
        "question": "Which currency do I pay in?",
        "answer": "Prices are in the local currency in Canada, Australia, Israel, Poland, Switzerland, Japan, South Korea, Taiwan, Hong Kong, Thailand, Singapore and India; in euros in the rest of the EU and in Iceland, Liechtenstein and Norway; in pounds in the UK; and in US dollars elsewhere. Your account and each company keep the currency of the country they were created or first used in, wherever you travel: change yours in Settings, and a company's on the top-up page (owners and admins). A company's top-ups, automatic ones too, are always charged in the company's currency. Changing it while automatic top-up is running shows you both amounts to confirm first, and the company's owners and admins get an email.",
    },
    {
        "key": "referrals",
        "question": "Can I earn credits by referring a company?",
        "answer": "Yes. Share the link on your company's Referrals tab: when a new company created through it first tops up, of any amount, both companies get {referral} credits, for up to 25 referrals a year. Only the first company of its owner's email counts, and your own companies don't.",
    },
    {
        "key": "refunds",
        "question": "Can I get a refund?",
        "answer": "Yes, for credits you bought in the last 14 days and haven't spent: on your company's billing page, through Paddle, or by writing to us. Credits reserved for candidates can't be refunded while reserved; those set aside within the 14 days can be refunded for 7 days after they come back. Free credits, such as the welcome gift, aren't refunded, and count as spent first. The [terms](/terms) have the details.",
    },
    {
        "key": "scorecards",
        "question": "What do scorecards show?",
        "answer": 'Every answer, whether it was right and how long it took. A grade is the percentage of points earned: each question is worth one point, and a "select all that apply" question earns part of it for each right option ticked, and nothing if a wrong one is ticked. Grades show green or red against the passing grade you set for the interview. Scorecards also flag answers too fast to have been read, times the candidate left the page, and copy attempts.',
    },
    {
        "key": "reports",
        "question": "Can I share results with a hiring manager?",
        "answer": "Yes. Download a PDF report for one candidate or for all of an interview's candidates, email it straight from testee, or send a short summary on WhatsApp, Telegram, Viber or LINE.",
    },
    {
        "key": "action_log",
        "question": "Can I see who did what in my company?",
        "answer": "Yes, if you own the company. Its Action log tab lists what its members did, newest first: inviting or removing candidates, viewing results, changing interviews, the team, billing and integrations, with who did it, when, and whether the assistant, an AI app, the API or an ATS did it for them. You can filter it by member, kind of action and dates, and download it as a CSV file. Actions are kept for 12 months. An API key's actions show under the key's name.",
    },
    {
        "key": "bias_audit",
        "question": "Can I export results for a bias audit?",
        "answer": "Yes, if you own the company. The Action log tab has a bias-audit export: a CSV file of every candidate who finished, for all interviews or one and between chosen dates, with their grade, the passing grade, whether they passed and whether they scored above the interview's median. testee holds no data on sex, race or ethnicity, so you add your candidates' own self-reported answers by email and remove the emails before giving the file to your independent auditor.",
    },
    {
        "key": "notes",
        "question": "Can my team keep notes on an interview?",
        "answer": "Yes. Each interview has a Notes tab where your team writes plain-text notes about the hiring round, such as whom to call next or, for an agency, which client the interview is for. Every member can write notes, viewers too, and edit their own; the author, owners and admins can delete one. Owners and admins can pin one note, which then shows under the interview's name. Candidates never see notes.",
    },
    {
        "key": "team",
        "question": "Can I add my team?",
        "answer": "Yes, and members cost nothing. On the company's Team tab, the owner invites each person by email as an admin or a viewer. Admins do everything except managing the team, seeing the action log and deleting the company. Viewers see interviews and results, share reports and write notes, but change nothing else and can't top up. One account can own several companies, each with its own team and credits.",
    },
    {
        "key": "integrations",
        "question": "Does testee work with my ATS or other tools?",
        "answer": "Yes, at no extra cost; candidates are charged as usual. Owners and admins connect Workable, Greenhouse, Teamtailor, Recruitee or Breezy HR on the company's Integrations tab with a key from the ATS, then link a job to an interview and a stage: candidates you move to that stage get the interview, and their results go back to the ATS ([how to connect skills tests to your ATS](/guides/ats-integration-skills-tests)). Slack can post your company's notifications to a channel, and the API lets your own platform create interviews, invite and manage candidates and receive their results, with each API key limited to what you tick for it; see the [API docs](/api-docs).",
    },
    {
        "key": "slack",
        "question": "How does the Slack integration work?",
        "answer": "An owner or admin chooses \"Add to Slack\" on the company's Integrations tab and picks one channel, then chooses which notifications go there, such as a candidate finished, an undelivered invite, an ATS candidate not invited or a new note. It's free.",
    },
    {
        "key": "api_keys",
        "question": "How do API keys work?",
        "answer": "Owners and admins make them on the company's API page, under Integrations. You tick what each key may do, choose when it expires (in 1, 3, 6 or 12 months, or never) and can limit it to allowed IP addresses. A key is shown once. A company can make 60 requests a minute. The [developer docs](/api-docs) describe every call.",
    },
    {
        "key": "webhooks",
        "question": "Can testee tell my system when a candidate finishes?",
        "answer": "Yes, with web hooks, set up on the company's API page. testee calls your address when a candidate starts, finishes (with their results), isn't reached, expires or is removed, and when an interview is ready, and signs each call with your secret. A call that fails is tried again for 3 days; then the web hook pauses until a test event goes through. Each web hook has a log of its latest sends. See the [web hooks docs](/api-docs?tab=webhooks).",
    },
    {
        "key": "embed",
        "question": "Can candidates take the interview on my own site?",
        "answer": "Yes, with testee's SDK: a script that shows the interview inside your page, on the sites you allow on the company's API page. Your server invites each candidate through the API with sign-in off, so they need no testee account and testee emails them nothing. It costs nothing extra; candidates are charged as usual. See the [SDK docs](/api-docs?tab=sdk).",
    },
    {
        "key": "ai_apps",
        "question": "Can I use testee from Claude, ChatGPT or my own AI agent?",
        "answer": "Yes. Add testee to Claude or ChatGPT as a connector (the steps are on your company's Integrations tab) and allow it on testee, to only read or to make changes too. The app then works with your companies, interviews and candidates' results as you, with your permissions. Deleting your account or a company is done only in testee. What the app reads reaches its provider under that app's terms. You can disconnect it at any time on the same tab, and owners and admins can switch AI apps off for a company. Other AI apps and agents you build yourself connect too: the developer docs' [MCP tab](/api-docs?tab=mcp) has the steps and example agents, and an agent on a server can sign in with an API key that has the AI agents permission, doing only what the key's other permissions allow. The [guide to AI agents, MCP and APIs](/guides/ai-agents-mcp-and-api) explains what each is for.",
    },
    {
        "key": "candidates",
        "question": "What do candidates see?",
        "answer": "Your company's name and logo, in your company's colors and fonts (set on its brand tab), what to expect before they start, then one timed question at a time. The interview never shows them their score or whether an answer was right; only their own data download has their grade.",
    },
    {
        "key": "brand",
        "question": "Can interviews carry my company's brand?",
        "answer": "Yes, at no extra cost. On the company's Brand tab, owners and admins set its logo, colors for the light and the dark theme, fonts and corner rounding. Candidates see them through the whole interview, without testee's header or footer, and the logo also shows in emails and reports.",
    },
    {
        "key": "candidate_account",
        "question": "Do candidates need an account?",
        "answer": "Yes, and it's free: they sign in with Google, LinkedIn or GitHub, with the verified email you invited, so a forwarded invite is of no use to anyone else. Through a shareable link, any verified email works. The exception is an invite your own platform makes through the API, which can skip sign-in.",
    },
    {
        "key": "verified",
        "question": "What does the verified check mean?",
        "answer": "That an owner or admin of the company signed in with a work email on the company's website, such as you@acme.com, and our team then reviewed the company. Add the website with Verify in your company's header; free email services don't count. While the review is pending, your team sees a clock next to the name, and renaming the company sends it for review again. The check shows next to your company's name, including in invites.",
    },
    {
        "key": "languages",
        "question": "Which languages are supported?",
        "answer": "{count} languages, for the site, the interviews and the emails. Choose the language an interview is written in, whatever language the job description is in.",
    },
    {
        "key": "mira",
        "question": "Who is Mira?",
        "answer": "testee's AI assistant: an AI, not a person, and its answers can be wrong. Open it with \"ask Mira\" in the header. Visitors can ask anything about testee. Signed in, Mira also reads your companies with your access and makes the changes you ask for, each only after you confirm it. Asking Mira uses no credits, and candidates don't get it during an interview.",
    },
    {
        "key": "search",
        "question": "Can I search testee?",
        "answer": "Yes. The search in the header finds, as you type, your companies, interviews and candidates (by name or email), and the site's pages, guides, comparisons, legal texts, FAQ questions and skills tests. Signed out, it finds only what's public.",
    },
    {
        "key": "privacy",
        "question": "What happens to job descriptions and answers?",
        "answer": "Job descriptions are used to build your company's interviews, and candidates' answers to score them for your company. The questions testee generates may also be reused in other companies' interviews and practice, without anything that identifies you, your company or anyone else; you can keep an interview's questions out of this in its settings. testee also learns general, anonymised patterns of question quality from how questions are answered, to improve how questions are generated. The [privacy policy](/privacy) explains what we keep, for how long, and everyone's rights.",
    },
    {
        "key": "question_bank",
        "question": "Are my interview's questions shared with other companies?",
        "answer": "By default, yes. A question testee generated can join its shared question bank once it has been answered a few times and passes checks that it names no organisation, person or contact details; the copy holds nothing that identifies your company. Owners and admins can keep an interview's questions out on its Settings tab; there's no company-wide setting. Questions already reused stay, even if your company is deleted.",
    },
    {
        "key": "ai_training",
        "question": "Is our data used to train AI models?",
        "answer": "OpenAI, which powers testee's AI, doesn't train its models on what we send it, under its API terms; it may keep it for up to 30 days, only to check for abuse unless the law requires longer. testee itself learns general, anonymised patterns of question quality, to improve how questions are generated.",
    },
    {
        "key": "data_storage",
        "question": "Where is our data stored?",
        "answer": "On Google Cloud, in Belgium. Some providers handle data in the United States, such as OpenAI and Resend, under the EU-US Data Privacy Framework or the European Commission's standard contractual clauses. The [trust page](/trust) lists them all.",
    },
    {
        "key": "eu_ai_law",
        "question": "Is it legal to use AI to screen candidates in the EU?",
        "answer": "Yes, with rules. Under the EU AI Act, tools that score candidates are very likely high-risk, with duties from 2 December 2027, and the GDPR already applies: a person makes the hiring decision, candidates are told AI is used, and records are kept. testee works that way: AI writes the questions, people at your company review the results and decide, and candidates are told before they start. This isn't legal advice; [Is AI hiring legal in the EU?](/guides/is-ai-hiring-legal-in-the-eu) explains the rules and the dates.",
    },
    {
        "key": "uk_us",
        "question": "Can we use testee for candidates in the UK and the US?",
        "answer": "Yes. The data processing agreement covers UK and US law, and the instructions for companies and the candidate notice templates (with New York City, Illinois, Colorado and Connecticut versions) cover what you must tell candidates. For jobs in New York City, use it only once you've done what Local Law 144 asks of you: an independent bias audit within the year before use, its summary published, and a notice to candidates 10 business days before. The Action log's bias-audit export gives your auditor each finished candidate's grade and result, to match with your candidates' own self-reported answers.",
    },
    {
        "key": "emails",
        "question": "Which emails does testee send, and how do I stop them?",
        "answer": "Service emails, such as invites, reports, billing emails and changes to our terms, can't be turned off; only an address that bounced for good or marked one of our emails as spam stops getting them. The rest, such as the daily activity digest, reminders, product updates and offers, you choose in Settings, under Emails, or stop with the Unsubscribe link in each email. Candidates can stop your company's emails, or an interview's reminders, with the links in their invites and reminders. testee's news shows in your notifications, the bell at the top; the major news also comes by email as a product update, only while that setting is on.",
    },
    {
        "key": "data_export",
        "question": "Can I download my data?",
        "answer": "Yes. \"Download my data\" in Settings gives you one JSON file with what testee holds about you; for a company's interviews, it has your answers and grades, but not which answers were right. There's no export of a whole company: its owner can download the action log, and members can download candidates' PDF reports.",
    },
    {
        "key": "candidate_data",
        "question": "How can a candidate have their data deleted?",
        "answer": "By asking the company that invited them: revoking a candidate who started erases them and their results for good. Or by deleting their testee account in Settings, which deletes their results. Otherwise, results are deleted automatically 12 months after the invitation was last sent.",
    },
    {
        "key": "delete",
        "question": "Can I delete my account?",
        "answer": "Yes, in Settings, unless you own a company others have joined: first make another member its owner, or delete it. Your account and your data are deleted, with the companies you alone belong to and their credits, so ask for any refund you're due first. A company keeps the record of your invite without your email, and purchase records stay as accounting law requires. You can download a copy of your data first.",
    },
    {
        "key": "company_delete",
        "question": "Can I delete a company?",
        "answer": "Yes, if you own it. Its interviews, candidates, results and credits go for good and its automatic top-up stops, so ask for any refund you're due first. Copies of its questions already in the shared question bank stay.",
    },
    {
        "key": "report",
        "question": "How do I report a problem?",
        "answer": "Write to us on the [contact page](/contact) and paste the ID of what it's about: \"copy id\" is under the name of a company, an interview or a candidate, and your account's is in your account menu and in Settings. With the ID we find it at once.",
    },
]
