import { cn } from "cn"
import type { LucideIcon } from "lucide-react"

import { PROMO_POP } from "@/features/landing/components/demo-panel"

/** One of the quality loop's steps: a card at (`x`, `y`) on the ring, its icon on its top edge,
 * its label and line. While `entering` is false (the loop not yet seen, motion allowed), it
 * waits unseen; then it pops in after `delay` milliseconds. Lit, the card takes the primary
 * border and its icon pulses with a spreading ring. `content` takes the label's box, for the
 * cards' one height. */
export function QualityStepCard({
  x,
  y,
  icon: Icon,
  label,
  line,
  lit,
  entering,
  delay,
  content,
}: {
  x: number
  y: number
  icon: LucideIcon
  label: string
  line: string
  lit: boolean
  entering: boolean
  delay: number
  content: (element: HTMLElement | null) => void
}) {
  return (
    <div
      data-testid="quality-step"
      data-lit={lit || undefined}
      style={
        {
          "--x": `${x}%`,
          "--y": `${y}%`,
          animationDelay: `${delay}ms`,
        } as React.CSSProperties
      }
      className={cn(
        "absolute start-(--x) top-(--y) z-10 flex size-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-2 rounded-xl border p-1.5 pt-6 text-center lowercase transition-shadow duration-300 lg:h-(--card-h) lg:w-60 lg:justify-start lg:p-5 lg:pt-9 rtl:translate-x-1/2",
        // The page's colour, see-through as much as the interview card among the ways in.
        "bg-background/75",
        entering ? PROMO_POP : "motion-safe:opacity-0",
        lit && "border-primary-gradient"
      )}
    >
      {/* The step's icon, sitting on the card's top edge; lit, it bumps and glows, and a ring
          spreads from it. */}
      <span
        className={cn(
          "absolute top-0 left-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border bg-background text-foreground lg:size-12 [&_svg]:size-5 lg:[&_svg]:size-6",
          lit &&
            "motion-safe:animate-[promo-press_0.6s_ease-out] motion-safe:[&_svg]:animate-[promo-tick_0.4s_ease-out]"
        )}
      >
        <Icon />
        {lit && (
          <span className="absolute inset-0 animate-[promo-ring_0.7s_ease-out_forwards] rounded-xl border-2 border-primary opacity-0 motion-reduce:hidden" />
        )}
      </span>
      <span
        ref={content}
        className="flex min-w-0 shrink-0 flex-col items-center"
      >
        <span className="flex min-w-0 flex-col gap-1">
          <span className="font-heading text-sm font-medium break-words lg:text-lg">
            {label}
          </span>
          <span className="hidden text-sm leading-snug text-muted-foreground normal-case lg:block">
            {line}
          </span>
        </span>
      </span>
    </div>
  )
}
