// The home page's "everything is free" section: the receipt that prints as it comes into view.
// Display only: the counts are a made-up interview's, the prices come from billing's catalog.

import type { DemoStep } from "@/hooks/use-demo-steps"

// The receipt's free lines, in order, by their text's key; each costs nothing.
export const FREE_LINES = [
  "create",
  "review",
  "invite",
  "reports",
  "connect",
] as const

// The made-up interview's invited candidates; as many answer as the biggest top-up pays for.
export const DEMO_INVITED = 500

// Blank until seen, then the free lines tick in one by one, a pause, and the paid line lands;
// the receipt then stays finished until it's scrolled back into view.
export const RECEIPT_STEPS: DemoStep[] = [
  { name: "blank", ms: 400 },
  { name: "free", ms: 170, repeat: FREE_LINES.length },
  { name: "pause", ms: 500 },
  { name: "paid", ms: 86_400_000 },
]

// What the section adds under its cards, in the order shown.
export const FREE_CARDS = ["results", "expire", "refund", "currencies"] as const

// The two previews' one card: the receipt and the prices beside it, alike. On phones it spans the
// screen, out of the page's side padding, with square corners.
export const PRICING_CARD =
  "relative -mx-6 flex w-[calc(100%+3rem)] flex-col overflow-hidden bg-background p-7 sm:mx-0 sm:w-full sm:rounded-xl sm:p-9"

// The prices' card, as it comes into view: blank, its rows flying in one after another, then the
// cheapest per candidate lit with its tag; it then stays until scrolled back into view.
export function priceSteps(rows: number): DemoStep[] {
  return [
    { name: "blank", ms: 400 },
    { name: "rows", ms: 160, repeat: rows },
    { name: "pause", ms: 700 },
    { name: "best", ms: 86_400_000 },
  ]
}
