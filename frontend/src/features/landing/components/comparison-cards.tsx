"use client"

import { cn } from "cn"
import { useState } from "react"

import { type DemoStep, useDemoSteps } from "@/hooks/use-demo-steps"

// Still off screen, then in view for as long as it stays: as ON_SCREEN, but resting still a
// moment on arrival, so the arrival is a render of its own and starts the cards' round.
const ARRIVING: DemoStep[] = [
  { name: "still", ms: 50 },
  { name: "in", ms: 86_400_000 },
]
// How much later each card comes in than the one before it, in milliseconds.
const STAGGER_MS = 90

// Where a card comes in from: one under another (phones), all rise from below; side by side,
// the first from the start side, the last from the end side (swapped right to left), and the
// ones between from below.
const FROM = {
  start:
    "[--enter-y:3.5rem] md:[--enter-x:-3.5rem] md:[--enter-y:0] md:rtl:[--enter-x:3.5rem]",
  end: "[--enter-y:3.5rem] md:[--enter-x:3.5rem] md:[--enter-y:0] md:rtl:[--enter-x:-3.5rem]",
  bottom: "[--enter-y:3.5rem]",
}

const ENTER =
  "motion-safe:animate-[promo-enter_0.7s_cubic-bezier(0.2,0.9,0.3,1.2)_both]"
// Unseen until it comes in, only with scripts running and motion allowed.
const WAITING = "motion-safe:[@media(scripting:enabled)]:opacity-0"

/** The comparison's cards in a row (one under another on phones), each its `className` and
 * `content`. They wait unseen until the row is in view, then come in, one after another, again
 * each time the row comes back into view:
 * the first from the start side, the last from the end side, the others from below. Without
 * scripts and with reduced motion, they simply show. */
export function ComparisonCards({
  cards,
}: {
  cards: { key: string; className: string; content: React.ReactNode }[]
}) {
  const { ref, index } = useDemoSteps<HTMLUListElement>(ARRIVING)
  // The row is still (its first step) off screen and plays once it's in view: each arrival is a
  // new round, and the cards, made anew for it, come in again.
  const [round, setRound] = useState(0)
  const [before, setBefore] = useState(index)

  if (index !== before) {
    setBefore(index)

    if (before === 0) {
      setRound(round + 1)
    }
  }

  const entered = round > 0 && index !== 0

  return (
    <ul ref={ref} className="grid w-full gap-3 md:grid-cols-3">
      {cards.map(({ key, className, content }, at) => (
        <li
          key={`${key}-${round}`}
          style={{ animationDelay: `${at * STAGGER_MS}ms` }}
          className={cn(
            className,
            FROM[side(at, cards.length)],
            entered ? ENTER : WAITING
          )}
        >
          {content}
        </li>
      ))}
    </ul>
  )
}

/** Which side the card at `at` of `count` comes in from, side by side. */
function side(at: number, count: number) {
  if (at === 0) {
    return "start"
  }

  return at === count - 1 ? "end" : "bottom"
}
