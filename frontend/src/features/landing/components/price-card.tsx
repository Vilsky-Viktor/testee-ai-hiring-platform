"use client"

import { cn } from "cn"
import { GiftIcon } from "lucide-react"
import { useMemo } from "react"

import { PRICING_CARD, priceSteps } from "@/config/free-to-start-demo"
import { PRIMARY_FILL } from "@/config/buttons"
import { countedAt, useDemoSteps } from "@/hooks/use-demo-steps"

// A row arriving: up from a little lower and faded, with a spring.
const FLY_IN =
  "motion-safe:animate-[promo-fly-up_0.5s_cubic-bezier(0.2,0.9,0.3,1.2)_both]"

/** The prices beside the receipt, in its card: the `free` candidates to start, then a row per
 * top-up (its price per candidate, `per`, and what it is, `pack`), flying in one after another as
 * the card comes into view; then the one the receipt uses (`used`), the cheapest per candidate,
 * lights up with its `best` tag. `children` (the buttons) close the card. With reduced motion,
 * all of it at once. */
export function PriceCard({
  free,
  rows,
  per,
  best,
  children,
}: {
  free: string
  rows: { key: string; price: string; pack: string; used: boolean }[]
  per: string
  best: string
  children: React.ReactNode
}) {
  // One list for as long as the rows stay, so the play isn't started again on every render.
  const steps = useMemo(() => priceSteps(rows.length), [rows.length])
  const { ref, index, n } = useDemoSteps<HTMLDivElement>(steps)
  const shown = countedAt(steps, { index, n }, "rows", rows.length)
  const lit = steps[index].name === "best"

  return (
    <div ref={ref} className={cn(PRICING_CARD, "gap-6")}>
      <p className="flex items-center gap-3 text-lg">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface text-primary">
          <GiftIcon className="size-5" />
        </span>
        {free}
      </p>
      <ul data-testid="price-list" className="space-y-2">
        {rows.map((row, at) => (
          <li
            key={row.key}
            data-used={row.used || undefined}
            className={cn(
              "relative flex items-baseline justify-between gap-4 rounded-xl bg-surface px-5 py-4 transition-[box-shadow,opacity] duration-500",
              at < shown ? FLY_IN : "motion-safe:opacity-0",
              // The best price, lit: a thin primary ring fading in.
              row.used && lit && "shadow-[inset_0_0_0_1px_var(--primary)]"
            )}
          >
            <span
              className={cn(
                "font-heading text-3xl font-medium tabular-nums transition-colors duration-500",
                row.used && lit && "text-primary"
              )}
            >
              {row.price}
              <span className="ms-1.5 font-sans text-sm font-normal text-muted-foreground">
                {per}
              </span>
            </span>
            <span className="text-sm whitespace-nowrap text-muted-foreground tabular-nums">
              {row.pack}
            </span>
            {/* Its tag, astride the row's top edge. */}
            {row.used && (
              <span
                className={cn(
                  "absolute end-4 top-0 -translate-y-1/2 rounded-full px-3 py-0.5 text-xs font-medium lowercase",
                  PRIMARY_FILL,
                  lit
                    ? "motion-safe:animate-[promo-pop_0.5s_cubic-bezier(0.2,0.9,0.3,1.2)_both]"
                    : "invisible"
                )}
              >
                {best}
              </span>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-auto">{children}</div>
    </div>
  )
}
