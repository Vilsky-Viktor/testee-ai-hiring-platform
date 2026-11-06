// What the "see who's best" demo (reports-demo.tsx) shows at a step, worked out from its steps.
import type { DemoMessage } from "@/features/landing/components/demo-chat"
import {
  DEMO_BEST,
  DEMO_CHAT_TIMES,
  DEMO_FLAGGED,
  type DemoCandidate,
} from "@/config/reports-demo"
import { REPORT_FIELDS, type ReportStep } from "@/config/reports-demo-steps"
import { stepIndex } from "@/hooks/use-demo-steps"

/** What's pressed in the share dialog at step `name`. */
export function popupPressed(name: string) {
  if (name === "send") {
    return "send"
  }

  return name.startsWith("whatsApp") ? "whatsApp" : null
}

/** The field lit at step `name`, the pointer at `point`: the one the pointer heads for, or the
 * chat's message box from a summary's arrival until its line is typed; "" for none. */
export function litField(name: string, point: string | undefined) {
  if (point && REPORT_FIELDS.has(point)) {
    return point
  }

  return /^(summary|typing)\d$/.test(name) ? "chatBox" : ""
}

/** The chat's messages at step `index`: each turn's summary (of `candidates`) once it arrives,
 * then its line once sent. */
export function messagesAt(
  steps: ReportStep[],
  index: number,
  lines: [string, string],
  candidates: DemoCandidate[]
): DemoMessage[] {
  const after = (name: string) => index >= stepIndex(steps, name)
  const messages: DemoMessage[] = []

  ;[DEMO_BEST, DEMO_FLAGGED].forEach((candidate, at) => {
    if (after(`summary${at}`)) {
      messages.push({
        summary: candidates[candidate],
        time: DEMO_CHAT_TIMES[at * 2],
      })
    }

    if (after(`sent${at}`)) {
      messages.push({ text: lines[at], time: DEMO_CHAT_TIMES[at * 2 + 1] })
    }
  })

  return messages
}
