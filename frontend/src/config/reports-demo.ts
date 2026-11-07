// The home page's "see who's best, share it in seconds" picture: an interview's candidates, two
// of their pages, the chat their summaries go to and the interview's notes. Display only.
import type { CandidateRowData } from "@/components/common/candidate-row"
import type { ReportsContent } from "@/features/landing/types/demo-content"

// The interview (its title, topics, questions and the other texts the picture shows are in each
// language: `landing.demoContent.reports`), its company (named in the chat summaries) and its
// passing grade.
export const DEMO_REPORT_INTERVIEW = {
  topics: 10,
  questions: 700,
}
export const DEMO_REPORT_COMPANY = "Acme"
export const DEMO_PASS_MARK = 70
// The minutes a candidate's page says they took.
export const DEMO_TIME_TAKEN = 18
// How many candidates the interview has; the list shows its first few.
export const DEMO_CANDIDATE_COUNT = 73
// How many notes it has before the new one; the notes tab shows the newest few.
export const DEMO_NOTE_COUNT = 15

// A topic of a candidate's page: its grade, the signals the browser reported on it, and one of
// its questions as they answered it: the option picked (and the right one), how many seconds it
// took and whether that was too fast, and the signals while it was open.
export type DemoTopic = {
  title: string
  grade: number
  // More of its questions as they answered them, when the row shows open.
  more?: NonNullable<DemoTopic["question"]>[]
  tab_leaves: number
  copies: number
  fast_answers: number
  question?: {
    text: string
    options: string[]
    pick: number
    right: number
    seconds: number
    fast?: boolean
    tab_leaves?: number
    copies?: number
  }
}

// A candidate in the list and, for the two opened, their page: their topics (the grades average
// to theirs, the signals add up to the row's) and what their answers show.
export type DemoCandidate = CandidateRowData & {
  name: string
  status: "finished" | "in_process"
  grade: number | null
  passed: boolean | null
  progress: number
  topics?: DemoTopic[]
  patterns?: {
    personFit?: {
      hardRight: number
      hard: number
      easyWrong: number
      easy: number
    }
    timing?: boolean
    followUp: { topic: string; text: string; right: string; wrong: string }
  }
}

// Each opened candidate's topics, in the topics' order: grade, page leaves, copies, fast answers.
// The grades average to the candidate's; the signals add up to the list's.
const BEST_TOPICS = [94, 88, 91, 90, 93, 89, 92, 90, 91, 92].map((grade) => [
  grade,
  0,
  0,
  0,
])
const FLAGGED_TOPICS = [
  [89, 2, 1, 2],
  [84, 1, 1, 2],
  [88, 1, 1, 1],
  [86, 1, 0, 1],
  [90, 1, 1, 1],
  [85, 1, 0, 1],
  [87, 1, 1, 1],
  [86, 0, 0, 1],
  [88, 1, 1, 1],
  [87, 0, 0, 1],
]

// The question shown under each of the first topics (its texts by key), as each candidate
// answered it.
type Answered = Omit<NonNullable<DemoTopic["question"]>, "text" | "options"> & {
  key: keyof ReportsContent["questions"]
}
const BEST_QUESTIONS: Answered[] = [
  { key: "strategy", pick: 0, right: 0, seconds: 38 },
  { key: "metrics", pick: 1, right: 1, seconds: 47 },
  { key: "stakeholders", pick: 1, right: 1, seconds: 29 },
]
const FLAGGED_QUESTIONS: Answered[] = [
  {
    key: "strategy",
    pick: 0,
    right: 0,
    seconds: 3,
    fast: true,
    tab_leaves: 2,
    copies: 1,
  },
  {
    key: "metrics",
    pick: 1,
    right: 1,
    seconds: 4,
    fast: true,
    tab_leaves: 1,
  },
  { key: "stakeholders", pick: 1, right: 1, seconds: 3, fast: true },
]

// The best candidate's open topic, under its question: one more, answered wrong.
const BEST_WRONG: Answered = { key: "metrics", pick: 0, right: 1, seconds: 52 }

/** A candidate's topics from their numbers, the first ones with their question, in `content`'s
 * language. */
function topicsOf(
  numbers: number[][],
  questions: Answered[],
  content: ReportsContent
) {
  return numbers.map(([grade, tab_leaves, copies, fast_answers], index) => {
    const answered = questions[index]

    return {
      title: content.topics[index],
      grade,
      tab_leaves,
      copies,
      fast_answers,
      question: answered && {
        ...answered,
        ...content.questions[answered.key],
      },
    }
  })
}

/** The interview's candidates, their topics and answers in `content`'s language. */
export const reportCandidates = (content: ReportsContent): DemoCandidate[] => [
  {
    name: "Liam Chen",
    email: "liam.chen@example.com",
    status: "finished",
    progress: 100,
    grade: 91,
    passed: true,
    tab_leaves: 0,
    copies: 0,
    fast_answers: 0,
    topics: topicsOf(BEST_TOPICS, BEST_QUESTIONS, content).map(
      (topic, index) =>
        index === 0
          ? {
              ...topic,
              more: [{ ...BEST_WRONG, ...content.questions.metrics }],
            }
          : topic
    ),
  },
  {
    name: "Ethan Brooks",
    email: "ethan.brooks@example.com",
    status: "finished",
    progress: 100,
    grade: 87,
    passed: true,
    tab_leaves: 9,
    copies: 6,
    fast_answers: 12,
    topics: topicsOf(FLAGGED_TOPICS, FLAGGED_QUESTIONS, content),
    patterns: {
      personFit: { hardRight: 9, hard: 10, easyWrong: 4, easy: 10 },
      timing: true,
      followUp: {
        topic: content.topics[1],
        text: content.questions.metrics.text,
        right: content.questions.metrics.options[1],
        wrong: content.questions.metrics.options[0],
      },
    },
  },
  {
    name: "Emma Larsen",
    email: "emma.larsen@example.com",
    status: "finished",
    progress: 100,
    grade: 84,
    passed: true,
    tab_leaves: 0,
    copies: 0,
    fast_answers: 1,
  },
  {
    name: "Daniel Okafor",
    email: "daniel.okafor@example.com",
    status: "finished",
    progress: 100,
    grade: 62,
    passed: false,
    tab_leaves: 1,
    copies: 0,
    fast_answers: 0,
  },
  {
    name: "Sofia Marquez",
    email: "sofia.marquez@example.com",
    status: "in_process",
    progress: 40,
    grade: null,
    passed: null,
    tab_leaves: 0,
    copies: 0,
    fast_answers: 0,
  },
]

// The best candidate, the one with many signals, and the runner-up the team also proceeds with.
export const DEMO_BEST = 0
export const DEMO_FLAGGED = 1
export const DEMO_RUNNER_UP = 2

// Who the list's report is emailed to.
export const DEMO_SHARE_EMAIL = "lisa@example.com"

// When each message in the chat the summaries go to shows.
export const DEMO_CHAT_TIMES = ["10:24", "10:25", "10:31", "10:32"]

// The interview's earlier notes from teammates (their texts in turn: `notes`), and how many
// hours ago each was written.
export const DEMO_NOTES = [
  { author: "Maya Patel", hoursAgo: 26 },
  { author: "Tom Becker", hoursAgo: 3 },
  { author: "Maya Patel", hoursAgo: 1 },
]

// The member writing the new note.
export const DEMO_AUTHOR = "Lisa Novak"

// What the report tells about how a candidate answered, explained under the demo, in the order
// shown.
export const INTEGRITY_SIGNALS = [
  "conduct",
  "fast",
  "patterns",
  "followUps",
] as const
