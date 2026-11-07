"use client"

import { cn } from "cn"

import { PROMO_POP } from "@/features/landing/components/demo-panel"
import { TRUST_POP_STAGGER_MS } from "@/config/trust-quality-demo"
import { ON_SCREEN, useDemoSteps } from "@/hooks/use-demo-steps"

/** A column's title, with the site's blue dot, and text. */
export function TrustCardText({
  title,
  children,
}: {
  title: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <>
      <h3 className="font-heading text-lg font-medium lowercase sm:text-xl">
        {title}
        <span className="blue-dot">.</span>
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
        {children}
      </p>
    </>
  )
}

/** A section's columns (trust, integrity signals), each its title and text: four side by side
 * from laptops up, split by thin lines; two by two below that. As a promo, they wait unseen until
 * in view, then pop in one after another; with reduced motion, they simply show. */
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
      data-testid="trust-cards"
      className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4 lg:gap-0 lg:divide-x"
    >
      {cards.map(({ key, content }, at) => (
        <li
          key={key}
          style={{ animationDelay: `${at * TRUST_POP_STAGGER_MS}ms` }}
          className={cn(
            "flex min-w-0 flex-col gap-2 lg:px-8 lg:py-2 lg:first:ps-0 lg:last:pe-0",
            shown ? PROMO_POP : "motion-safe:opacity-0"
          )}
        >
          {content}
        </li>
      ))}
    </ul>
  )
}
