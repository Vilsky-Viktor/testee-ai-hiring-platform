// The home page's "see who's best" demo: its steps, and what each shows.
import type { DemoStep } from "@/hooks/use-demo-steps"

// A step's screen: the candidates list, a candidate's page (by their place), the chat or the
// notes; with what lies over it, and what's typed and sent so far.
export type ReportStep = DemoStep & {
  screen: "list" | "page" | "chat" | "notes" | "slack"
  candidate?: number
  popup?: boolean
  // The report's "⋮" menu open.
  menu?: boolean
  notice?: boolean
  download?: boolean
  // How far a candidate's page is scrolled down, in pixels.
  scrolled?: number
  // Their first topic clicked open.
  expanded?: boolean
}

// How far each candidate's page scrolls to show its lower parts, in pixels.
const SCROLL = 560

// Typing speeds, a letter each this many milliseconds.
const TYPE_MS = 60

/** A candidate's turn: their row clicked, their page, shared to WhatsApp, and in the chat their
 * summary, then `line` typed and sent. Steps are named with `at`. */
function shareTurn(at: number, candidate: number, line: string): ReportStep[] {
  const page = { screen: "page" as const, candidate }
  const chat = { screen: "chat" as const, candidate }
  const read = { ...page, expanded: at === 0 }

  return [
    { name: `aimRow${at}`, ms: 900, point: `row${candidate}`, screen: "list" },
    { name: `openRow${at}`, ms: 450, click: true, screen: "list" },
    { name: `page${at}`, ms: 1400, point: "none", ...page },
    // The best candidate's first topic clicked open, to show their answers.
    ...(at === 0
      ? [
          { name: "aimTopic", ms: 800, point: "topic0", ...page },
          { name: "openTopic", ms: 700, click: true, ...read },
        ]
      : []),
    { name: `scrollDown${at}`, ms: 2600, scrolled: SCROLL, ...read },
    { name: `scrollUp${at}`, ms: 2000, ...read },
    { name: `aimDots${at}`, ms: 800, point: "dots", ...read },
    { name: `openMenu${at}`, ms: 350, click: true, ...read },
    { name: `aimShare${at}`, ms: 500, point: "share", menu: true, ...read },
    { name: `share${at}`, ms: 500, click: true, menu: true, ...read },
    {
      name: `aimWhatsApp${at}`,
      ms: 800,
      point: "whatsApp",
      popup: true,
      ...read,
    },
    { name: `whatsApp${at}`, ms: 450, click: true, popup: true, ...read },
    { name: `summary${at}`, ms: 1500, point: "none", ...chat },
    { name: `typing${at}`, ms: TYPE_MS, repeat: line.length, ...chat },
    { name: `aimSend${at}`, ms: 700, point: "chatSend", ...chat },
    { name: `send${at}`, ms: 450, click: true, ...chat },
    { name: `sent${at}`, ms: 800, point: "none", ...chat },
  ]
}

/** The steps, with the two lines typed in the chat and the note typed last: the list; its PDF
 * downloaded; emailed to the manager; the best candidate's page shared to WhatsApp, with
 * `lines[0]`; back to the list, the flagged candidate's the same, with `lines[1]`; then the
 * notes, `note` typed and posted; last, the Slack channel testee posts to, scrolled to its
 * newest message: the still frame. */
export function reportSteps(
  best: number,
  flagged: number,
  lines: [string, string],
  email: string,
  note: string
): ReportStep[] {
  return [
    { name: "list", ms: 1000, point: "none", screen: "list" },
    { name: "aimDots", ms: 800, point: "dots", screen: "list" },
    { name: "openMenu", ms: 350, click: true, screen: "list" },
    {
      name: "aimDownload",
      ms: 500,
      point: "download",
      screen: "list",
      menu: true,
    },
    { name: "download", ms: 500, click: true, screen: "list", menu: true },
    { name: "downloaded", ms: 900, screen: "list", download: true },
    { name: "aimDots2", ms: 800, point: "dots", screen: "list" },
    { name: "openMenu2", ms: 350, click: true, screen: "list" },
    { name: "aimShare", ms: 500, point: "share", screen: "list", menu: true },
    { name: "share", ms: 500, click: true, screen: "list", menu: true },
    { name: "aimEmail", ms: 700, point: "email", screen: "list", popup: true },
    { name: "focusEmail", ms: 300, click: true, screen: "list", popup: true },
    {
      name: "typingEmail",
      ms: TYPE_MS,
      repeat: email.length,
      screen: "list",
      popup: true,
    },
    { name: "aimSend", ms: 700, point: "send", screen: "list", popup: true },
    { name: "send", ms: 450, click: true, screen: "list", popup: true },
    { name: "sent", ms: 1500, point: "none", screen: "list", notice: true },
    ...shareTurn(0, best, lines[0]),
    { name: "back", ms: 600, point: "none", screen: "list" },
    ...shareTurn(1, flagged, lines[1]),
    { name: "list2", ms: 500, point: "none", screen: "list" },
    { name: "aimNotes", ms: 800, point: "notesTab", screen: "list" },
    { name: "openNotes", ms: 450, click: true, screen: "list" },
    { name: "notes", ms: 900, point: "noteBox", screen: "notes" },
    { name: "focusNote", ms: 300, click: true, screen: "notes" },
    { name: "typingNote", ms: TYPE_MS, repeat: note.length, screen: "notes" },
    { name: "aimPost", ms: 700, point: "post", screen: "notes" },
    { name: "post", ms: 450, click: true, screen: "notes" },
    { name: "posted", ms: 1200, point: "none", screen: "notes" },
    { name: "slack", ms: 900, screen: "slack" },
    { name: "slackScrolled", ms: 3800, screen: "slack" },
  ]
}

// What the pointer moves to, found in the demo by these selectors.
export const REPORT_TARGETS = [
  "topic0",
  "dots",
  "download",
  "share",
  "email",
  "send",
  "whatsApp",
  "chatSend",
  "notesTab",
  "noteBox",
  "post",
  "row0",
  "row1",
  "row2",
  "row3",
  "row4",
  "chatBox",
]

// Where each screen lies in the demo's order: a later one rises into place, an earlier one comes
// back from where it lifted away.
export const REPORT_SCREEN_ORDER: Record<ReportStep["screen"], number> = {
  list: 0,
  page: 1,
  chat: 2,
  notes: 3,
  slack: 4,
}

// The big moments, each marked by a burst: the PDF emailed, the best candidate's page, and each
// report shared to the chat.
export const REPORT_BURSTS = new Set(["sent"])

// The fields typed in that the pointer heads for: each lights up from then.
export const REPORT_FIELDS = new Set(["email", "noteBox"])
