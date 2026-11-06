import { cn } from "cn"
import type { LucideIcon } from "lucide-react"

import { PRIMARY_FILL } from "@/config/buttons"

// The pop-in (PROMO_POP's), then the background's breath (promo-solid, promo-sections.css), both together.
const BREATHING =
  "motion-safe:animate-[promo-pop_0.5s_cubic-bezier(0.2,0.9,0.3,1.2)_both,promo-solid_3s_ease-in-out_0.5s_infinite]"
// What fades in and out with the comet passing under the card.
const FADE =
  "transition-[opacity,background-color,color] duration-500 ease-in-out"

/** One of the quality loop's steps, the `step`-th: a card at (`x`, `y`) on the ring. From laptops
 * up it lies sideways: its icon in a tile at the start, its label and line beside it, and its
 * number in the corner; on smaller screens, a small square with the icon over the label. While
 * `entering` is false (the loop not yet seen, motion allowed), it waits unseen; then it pops in
 * after `delay` milliseconds, and its see-through background breathes to solid and back from then
 * on. Lit as the comet passes under it, a primary bar fades in along its start edge, its icon's
 * tile takes the primary colour and the primary border fades in over its own; all fade out once
 * it isn't. `content` takes the text's box, for the cards' one height. */
export function QualityStepCard({
  step,
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
  step: number
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
        "absolute start-(--x) top-(--y) z-10 flex size-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-2 rounded-xl border p-1.5 text-center lowercase lg:h-(--card-h) lg:w-72 lg:flex-row lg:items-start lg:justify-start lg:gap-4 lg:p-4 lg:text-start rtl:translate-x-1/2",
        // The page's colour, see-through as much as the interview card among the ways in.
        "bg-background/75",
        // Popping in, then breathing from see-through to solid and back, for as long as it shows.
        entering ? BREATHING : "motion-safe:opacity-0"
      )}
    >
      {/* The primary border over the card's own. */}
      <span
        aria-hidden
        className={cn(
          "border-primary-gradient pointer-events-none absolute inset-0 rounded-[inherit]",
          FADE,
          lit ? "opacity-100" : "opacity-0"
        )}
      />
      {/* The accent along the start edge. */}
      <span
        aria-hidden
        className={cn(
          `pointer-events-none absolute inset-y-4 start-0 hidden w-1 rounded-e-full lg:block ${PRIMARY_FILL}`,
          FADE,
          lit ? "opacity-100" : "opacity-0"
        )}
      />
      {/* The step's number on the card's corner, over its border, from laptops up. */}
      <span
        aria-hidden
        className={cn(
          "absolute end-0 top-0 hidden size-9 translate-x-1/3 -translate-y-1/3 items-center justify-center rounded-full border bg-background font-heading text-base font-medium tabular-nums lg:flex rtl:-translate-x-1/3",
          FADE,
          lit ? "border-primary text-primary" : "text-muted-foreground"
        )}
      >
        {step}
      </span>
      {/* The step's icon in its tile, tinted primary while lit; it bumps as the comet arrives. */}
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl lg:size-11 [&_svg]:size-5 lg:[&_svg]:size-6",
          FADE,
          lit
            ? "bg-primary/15 text-primary motion-safe:[&_svg]:animate-[promo-tick_0.4s_ease-out]"
            : "bg-surface text-foreground"
        )}
      >
        <Icon />
      </span>
      <span
        ref={content}
        className="flex min-w-0 shrink-0 flex-col items-center lg:shrink lg:items-start lg:pe-4"
      >
        <span className="flex min-w-0 flex-col gap-1">
          <span className="font-heading text-sm font-medium break-words lg:text-lg">
            {label}
            {/* The logo's blue dot, as every title ends. */}
            <span className="blue-dot">.</span>
          </span>
          <span className="hidden text-sm leading-snug text-muted-foreground normal-case lg:block">
            {line}
          </span>
        </span>
      </span>
    </div>
  )
}
