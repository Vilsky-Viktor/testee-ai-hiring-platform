import type { DemoCardState } from "@/features/landing/components/demo-action-card"
import type { AskAgentCard, AskAgentQuestion } from "@/config/ask-agent-demo"
import type { DemoStep } from "@/hooks/use-demo-steps"
import { sliceGraphemes } from "@/lib/graphemes"

// The "just ask Mira" promo's steps (components/ask-agent-demo.tsx).

// A step and what it shows: how many of the chat's items (each question, its answer, and the
// action card before the last answer), the question in the input, the tool at work, the action
// card's state and the card beside the chat that's lit.
export type Step = DemoStep & {
  upTo: number
  // The microphone held, the voice heard; then let go, what was said being turned into text.
  listening?: boolean
  transcribing?: boolean
  asking?: AskAgentQuestion
  working?: AskAgentQuestion
  card?: DemoCardState
  lit?: AskAgentCard
}

// One question asked: the pointer clicks into the input, it's typed and sent, and the tool
// reads while the answer is written; `before` items are in the chat already.
function asked(
  question: AskAgentQuestion,
  letters: number,
  before: number,
  lit: AskAgentCard
): Step[] {
  const shared = { upTo: before, lit, asking: question }

  return [
    { name: `aim-${question}`, ms: 800, point: "input", upTo: before, lit },
    { name: `focus-${question}`, ms: 300, click: true, ...shared },
    { name: `type-${question}`, ms: 45, repeat: letters, ...shared },
    { name: `aimSend-${question}`, ms: 600, point: "send", ...shared },
    { name: `send-${question}`, ms: 400, click: true, ...shared },
    {
      name: `work-${question}`,
      ms: 700,
      point: "none",
      upTo: before + 1,
      lit,
      working: question,
    },
  ]
}

// One question said instead: the pointer holds the microphone while it's said, lets go, and it's
// turned into text and sent by itself, as the real voice button does; then the tool reads.
function spoken(
  question: AskAgentQuestion,
  before: number,
  lit: AskAgentCard
): Step[] {
  const shared = { upTo: before, lit, asking: question }

  return [
    { name: `aimMic-${question}`, ms: 700, point: "mic", upTo: before, lit },
    {
      name: `hold-${question}`,
      ms: 2000,
      click: true,
      listening: true,
      ...shared,
    },
    { name: `transcribe-${question}`, ms: 600, transcribing: true, ...shared },
    {
      name: `work-${question}`,
      ms: 700,
      point: "none",
      upTo: before + 1,
      lit,
      working: question,
    },
  ]
}

/** The whole conversation: the three questions, the first and last typed in `letters` each and
 * the second said aloud, with their answers, the last after its action's card is confirmed; then
 * a pause on the complete frame. */
export function demoSteps(letters: Record<AskAgentQuestion, number>): Step[] {
  return [
    { name: "start", ms: 300, point: "none", upTo: 0 },
    ...asked("stats", letters.stats, 0, "info"),
    { name: "answer-stats", ms: 1400, upTo: 2, lit: "info" },
    // Asked aloud, holding the microphone.
    ...spoken("help", 2, "help"),
    { name: "answer-help", ms: 2000, upTo: 4, lit: "help" },
    ...asked("invite", letters.invite, 4, "actions"),
    { name: "card", ms: 500, upTo: 6, card: "pending", lit: "actions" },
    {
      name: "aimConfirm",
      ms: 800,
      point: "confirm",
      upTo: 6,
      card: "pending",
      lit: "actions",
    },
    {
      name: "confirm",
      ms: 400,
      click: true,
      upTo: 6,
      card: "pending",
      lit: "actions",
    },
    {
      name: "running",
      ms: 400,
      point: "none",
      upTo: 6,
      card: "running",
      lit: "actions",
    },
    { name: "done", ms: 1500, upTo: 7, lit: "actions" },
    { name: "end", ms: 400, upTo: 7 },
  ]
}

/** What the input shows at `step`, asking `question`: its first `n` letters while typed, nothing
 * once clicked into, the placeholder (null) while it's said aloud, else the whole question. */
export function inputText(step: Step, question: string | null, n: number) {
  if (step.name.startsWith("type-")) {
    return sliceGraphemes(question!, n)
  }

  if (step.name.startsWith("focus-")) {
    return ""
  }

  return step.listening || step.transcribing ? null : question
}
