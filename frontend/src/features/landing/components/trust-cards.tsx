"use client"

import { cn } from "cn"

import { PROMO_POP } from "@/features/landing/components/demo-panel"
import { TRUST_POP_STAGGER_MS } from "@/config/trust-quality-demo"
import { ON_SCREEN, useDemoSteps } from "@/hooks/use-demo-steps"

/** The trust section's columns, each its title and text: four side by side from laptops up,
 * split by thin lines; one under another below that, the lines across the whole screen on
 * phones. As a promo, they wait unseen until in view, then pop in one after another; with
 * reduced motion, they simply show. */
export function TrustCards({
  cards,
}: {
  cards: { key: string; content: React.ReactNode }[]
}) {
  const { ref, index } = useDemoSteps<HTMLUListElement>(ON_SCREEN)
  const shown = ON_SCREEN[index].name === "playing"

  return (
    <ul
      ref={ref}
      className="grid divide-y max-sm:-mx-6 lg:grid-cols-4 lg:divide-x lg:divide-y-0"
    >
      {cards.map(({ key, content }, at) => (
        <li
          key={key}
          style={{ animationDelay: `${at * TRUST_POP_STAGGER_MS}ms` }}
          className={cn(
            "flex flex-col gap-2 py-8 max-lg:first:pt-0 max-lg:last:pb-0 max-sm:px-6 lg:px-8 lg:py-2 lg:first:ps-0 lg:last:pe-0",
            shown ? PROMO_POP : "motion-safe:opacity-0"
          )}
        >
          {content}
        </li>
      ))}
    </ul>
  )
}
