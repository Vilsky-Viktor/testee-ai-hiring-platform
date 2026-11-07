// The home page's "what candidates see" picture: an invitation to an interview and one of its
// questions, in click mode and then in voice mode. Display only.
import type { CandidatesContent } from "@/features/landing/types/demo-content"

// The inviting company (the interview's title is a text of each language:
// `landing.demoContent.candidates`), and its times: 4 topics of 10 questions, a minute each.
export const DEMO_COMPANY = "Acme"
export const DEMO_QUESTION_SECONDS = 60
export const DEMO_TOTAL_MINUTES = 40
export const DEMO_SECTIONS = 4
export const DEMO_SECTION_QUESTIONS = 10

// A question as a candidate plays it: its texts' key (its topic, text and options, in each
// language: `landing.demoContent.candidates.questions`), its topic's place, how many of the
// topic's questions are answered and, for a practical one, the example it shows (in
// `language`); the options picked, in turn (a multi-answer question ticks several).
export type DemoQuestionPlay = {
  key: keyof CandidatesContent["questions"]
  section: number
  answered: number
  example?: { code: string; language: string }
  picks: number[]
  multi?: boolean
}

// The question with its texts, as the picture shows it.
export type DemoQuestion = DemoQuestionPlay &
  CandidatesContent["questions"][DemoQuestionPlay["key"]]

// The questions answered in click mode: one answer, several, and one with an example.
export const CLICK_QUESTIONS: DemoQuestionPlay[] = [
  {
    key: "median",
    section: 1,
    answered: 3,
    picks: [1],
  },
  {
    key: "revenue",
    section: 1,
    answered: 4,
    picks: [0, 1],
    multi: true,
  },
  {
    // North's rows sum to 180, South's to 80: only North passes HAVING.
    key: "sql",
    section: 2,
    answered: 0,
    example: {
      code: [
        "-- orders(region, amount):",
        "-- North 120, South 80, North 60",
        "SELECT region FROM orders GROUP BY",
        "  region HAVING SUM(amount) > 100;",
      ].join("\n"),
      language: "sql",
    },
    picks: [0],
  },
]

// The question Mira reads in voice mode.
export const VOICE_QUESTION: DemoQuestionPlay = {
  key: "chart",
  section: 2,
  answered: 5,
  picks: [1],
}

// The site asking for the microphone in the browser's prompt.
export const DEMO_SITE = "testee.ai"

// What the section explains under its demo, in the order shown.
export const CANDIDATE_CARDS = ["modes", "phone", "time", "extraTime"] as const
