import {
  ArrowLeftRightIcon,
  CodeXmlIcon,
  CoinsIcon,
  FileTextIcon,
  GraduationCapIcon,
  LanguagesIcon,
  LayoutTemplateIcon,
  MapPinIcon,
  PersonStandingIcon,
  RefreshCwIcon,
  ScaleIcon,
  ShieldCheckIcon,
  type LucideIcon,
} from "lucide-react"

import type { FeatureShotName } from "@/config/features-shots"
import type {
  SolutionCardKey,
  SolutionId,
  SolutionMoreKey,
  SolutionPointKey,
  SolutionRowKey,
} from "@/types/solutions"

// The solution pages, one per term buyers search for, built like the features page: a promise,
// rows of a text beside a picture of the real app, cards and the start box. Their texts are
// "solutions.pages.<id>", "solutions.rows.<key>", "solutions.points.<key>" and
// "solutions.cards.<key>".

export type SolutionRow = {
  key: SolutionRowKey
  shot: FeatureShotName
  points: readonly SolutionPointKey[]
}

export type Solution = {
  id: SolutionId
  path: string
  rows: readonly SolutionRow[]
  // The card named `price` needs the prices, and is left out without them.
  cards: readonly { key: SolutionCardKey; icon: LucideIcon }[]
  more: readonly { href: string; key: SolutionMoreKey }[]
}

const LANGUAGES = { key: "languages", icon: LanguagesIcon } as const
const ATS = { key: "ats", icon: ArrowLeftRightIcon } as const
const ACCESSIBLE = { key: "accessible", icon: PersonStandingIcon } as const
const PRICE = { key: "price", icon: CoinsIcon } as const
const FEATURES = { href: "/features", key: "features" } as const
const TESTS = { href: "/tests", key: "tests" } as const

export const SKILLS_ASSESSMENT: Solution = {
  id: "skillsAssessment",
  path: "/guides/skills-assessment-software",
  rows: [
    {
      key: "fromDescription",
      shot: "topics",
      points: ["anyRole", "options", "maxQuestions"],
    },
    {
      key: "sameRules",
      shot: "question",
      points: ["onePass", "sameMix", "extraTime"],
    },
    {
      key: "compare",
      shot: "candidates",
      points: ["sort", "pdf", "peopleDecide"],
    },
  ],
  cards: [
    { key: "readyTests", icon: LayoutTemplateIcon },
    LANGUAGES,
    ATS,
    { key: "integrity", icon: ShieldCheckIcon },
    ACCESSIBLE,
    PRICE,
  ],
  more: [
    TESTS,
    { href: "/guides/pre-employment-testing", key: "testingGuide" },
    FEATURES,
  ],
}

export const AI_INTERVIEW: Solution = {
  id: "aiInterview",
  path: "/guides/ai-interview-software",
  rows: [
    {
      key: "aiWrites",
      shot: "flow-questions",
      points: ["keysChecked", "weakFixed", "preview"],
    },
    {
      key: "voice",
      shot: "voice",
      points: ["ownMode", "voiceLanguages", "noVoiceKept"],
    },
    {
      key: "personDecides",
      shot: "signals",
      points: ["noCamera", "noInference", "notProof"],
    },
  ],
  cards: [
    { key: "documents", icon: FileTextIcon },
    { key: "biasAudit", icon: ScaleIcon },
    { key: "noTraining", icon: ShieldCheckIcon },
    { key: "location", icon: MapPinIcon },
    ACCESSIBLE,
    PRICE,
  ],
  more: [
    { href: "/guides/ai-interviews", key: "interviewsGuide" },
    { href: "/trust", key: "trust" },
    FEATURES,
  ],
}

export const CODING_TEST: Solution = {
  id: "codingTest",
  path: "/guides/coding-test-for-hiring",
  rows: [
    {
      key: "stack",
      shot: "topics",
      points: ["freeReview", "maxQuestions", "startFromTest"],
    },
    {
      key: "readingCode",
      shot: "code-question",
      points: ["shortExamples", "options", "noSetup"],
    },
    {
      key: "signals",
      shot: "signals",
      points: ["notProof", "noCamera", "ownQuestions"],
    },
  ],
  cards: [
    ATS,
    { key: "platform", icon: CodeXmlIcon },
    { key: "quality", icon: RefreshCwIcon },
    { key: "practice", icon: GraduationCapIcon },
    LANGUAGES,
    PRICE,
  ],
  more: [
    { href: "/guides/hiring-engineers", key: "engineersGuide" },
    TESTS,
    FEATURES,
  ],
}

// The solution pages, listed with the guides, and when their text last changed.
export const SOLUTIONS = [SKILLS_ASSESSMENT, AI_INTERVIEW, CODING_TEST] as const
export const SOLUTIONS_UPDATED = "2026-11-07"
