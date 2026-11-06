import {
  BellIcon,
  BotMessageSquareIcon,
  ChartColumnIcon,
  CodeXmlIcon,
  FileSpreadsheetIcon,
  LinkIcon,
  MailIcon,
  MessageCircleIcon,
  ArrowLeftRightIcon,
  WebhookIcon,
  FileTextIcon,
  ListChecksIcon,
  SendIcon,
  Share2Icon,
  SlidersHorizontalIcon,
  SparklesIcon,
  TrophyIcon,
  UserRoundIcon,
  type LucideIcon,
} from "lucide-react"

import type { FeatureShotName } from "@/config/features-shots"
import type { FlowStageKey } from "@/types/hiring-flow"

// The hiring flow page (app/hiring-flow/page.tsx): its stages from top to bottom, each a node
// on the line with its text, its options as chips and a picture of the real app (the features
// page's). `branches` are the ways a stage can go, drawn as the line fanning
// out into cards. Texts are "hiringFlow.stages.<key>" (title, text, points.<point>,
// branches.<branch>.title and .text, alt).
export type FlowStage = {
  key: FlowStageKey
  icon: LucideIcon
  points: readonly string[]
  shot?: FeatureShotName
  branches?: readonly { key: string; icon: LucideIcon }[]
}

export const FLOW_STAGES: readonly FlowStage[] = [
  {
    key: "describe",
    icon: FileTextIcon,
    shot: "create",
    points: ["paste", "template", "mira", "language", "free"],
  },
  {
    key: "topics",
    icon: ListChecksIcon,
    shot: "flow-review",
    points: ["proposed", "edit", "ask", "subtopics", "levels", "approve"],
  },
  {
    key: "questions",
    icon: SparklesIcon,
    shot: "flow-questions",
    points: ["unique", "checked", "bank", "multi", "preview", "manage"],
  },
  {
    key: "settings",
    icon: SlidersHorizontalIcon,
    shot: "flow-settings",
    points: ["count", "time", "passMark", "mode", "brand", "private"],
  },
  {
    key: "invite",
    icon: SendIcon,
    shot: "flow-invite",
    points: ["names", "reminder", "expire", "credits"],
    branches: [
      { key: "email", icon: MailIcon },
      { key: "list", icon: FileSpreadsheetIcon },
      { key: "link", icon: LinkIcon },
      { key: "ats", icon: ArrowLeftRightIcon },
      { key: "api", icon: CodeXmlIcon },
      { key: "ai", icon: BotMessageSquareIcon },
    ],
  },
  {
    key: "candidate",
    icon: UserRoundIcon,
    shot: "flow-question",
    points: [
      "signIn",
      "pledge",
      "timer",
      "onePass",
      "click",
      "voice",
      "phone",
      "extraTime",
    ],
  },
  {
    key: "results",
    icon: ChartColumnIcon,
    shot: "flow-candidates",
    points: [
      "scorecard",
      "answers",
      "signals",
      "patterns",
      "followUps",
      "notes",
      "discover",
    ],
  },
  {
    key: "share",
    icon: Share2Icon,
    shot: "flow-share",
    points: ["pdf", "digest", "bell"],
    branches: [
      { key: "email", icon: MailIcon },
      { key: "chat", icon: MessageCircleIcon },
      { key: "ats", icon: ArrowLeftRightIcon },
      { key: "slack", icon: BellIcon },
      { key: "webhooks", icon: WebhookIcon },
    ],
  },
  {
    key: "decide",
    icon: TrophyIcon,
    shot: "flow-report",
    points: ["hired", "biasAudit", "log"],
  },
]
