import type { Messages } from "next-intl"

// The texts the landing's demo pictures show, in each language (`landing.demoContent` in
// messages/): the made-up job, interviews, candidates and chats they play. Typed from en.json;
// every language has the same keys.
export type DemoContent = Messages["landing"]["demoContent"]

// The "create an interview" demo: the job description pasted, the interview's title, the topics
// proposed (in order), the words typed at the end of one topic's name and of one of its
// subtopics, the change asked of the AI and the topic it adds.
export type CreateContent = DemoContent["create"]

// The "what candidates see" demo: the interview's title and its questions (topic, text and
// options), by name.
export type CandidatesContent = DemoContent["candidates"]

// The "see who's best" demo: the interview's title and topics, the questions answered, the chat
// the summaries go to, the teammates' earlier notes and the PDF's name.
export type ReportsContent = DemoContent["reports"]
