"use client"

import { cn } from "cn"
import { CheckIcon, UserRoundIcon } from "lucide-react"
import { useLocale } from "next-intl"

import { KeepAcronyms } from "@/components/common/keep-acronyms"
import { PromoBurst } from "@/features/landing/components/promo-burst"
import {
  FREE_LINES,
  PRICING_CARD,
  RECEIPT_STEPS,
} from "@/config/free-to-start-demo"
import { useCountUp } from "@/hooks/use-count-up"
import { formatPrice } from "@/lib/format"
import { countedAt, useDemoSteps } from "@/hooks/use-demo-steps"

// A line not printed yet keeps its room, so the receipt doesn't grow as it prints.
const PRINTED =
  "animate-in duration-300 fade-in slide-in-from-top-1 motion-reduce:animate-none"

/** A receipt for a whole interview: its free lines print one by one as it comes into view, each
 * ticked as costing nothing, then the one paid line, the candidates who answered, its amount and
 * the total counting up to `paidCents` (in `currency`), and a burst as the total lands. With
 * reduced motion, the complete receipt. */
export function Receipt({
  free,
  zero,
  paid,
  paidCents,
  currency,
  totalLabel,
  perCandidate,
}: {
  free: Record<(typeof FREE_LINES)[number], string>
  zero: string
  paid: string
  paidCents: number
  currency: string
  totalLabel: string
  perCandidate: string
}) {
  const { ref, index, n } = useDemoSteps<HTMLDivElement>(RECEIPT_STEPS)
  const printed = countedAt(
    RECEIPT_STEPS,
    { index, n },
    "free",
    FREE_LINES.length
  )
  const landed = RECEIPT_STEPS[index].name === "paid"
  const locale = useLocale()
  const paidAmount = formatPrice(
    useCountUp(landed ? paidCents : 0).shown,
    currency,
    locale
  )

  return (
    <div
      ref={ref}
      aria-hidden
      data-testid="receipt"
      className={cn(PRICING_CARD, "justify-between text-lg")}
    >
      {/* The total landing. */}
      {landed && <PromoBurst />}
      <ul className="space-y-3">
        {FREE_LINES.map((key, at) => (
          <ReceiptLine
            key={key}
            label={<KeepAcronyms text={free[key]} />}
            amount={zero}
            ticked={at < printed}
            className={at < printed ? PRINTED : "invisible"}
          />
        ))}
        <ReceiptLine
          label={
            <span className="flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface">
                <UserRoundIcon className="size-4 text-primary" />
              </span>
              {paid}
            </span>
          }
          amount={paidAmount}
          // No check, its room kept, so the amounts line up.
          ticked={false}
          className={cn(
            "pt-1 font-medium text-primary",
            landed ? PRINTED : "invisible"
          )}
        />
      </ul>
      <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-foreground/15 pt-4">
        <span className="font-heading text-lg font-medium lowercase">
          {totalLabel}
        </span>
        <span className="text-end">
          <span
            data-testid="receipt-total"
            className="font-heading text-3xl font-medium tabular-nums"
          >
            {paidAmount}
          </span>
          <span
            className={cn(
              "block text-xs text-muted-foreground",
              !landed && "invisible"
            )}
          >
            {perCandidate}
          </span>
        </span>
      </div>
    </div>
  )
}

/** A receipt line: what it is, a dotted leader and its amount at the end; `ticked`, a check
 * pops in after the amount (a free line's). */
function ReceiptLine({
  label,
  amount,
  ticked,
  className,
}: {
  label: React.ReactNode
  amount: string
  ticked?: boolean
  className?: string
}) {
  return (
    <li className={cn("flex items-end gap-2 lowercase", className)}>
      <span className="min-w-0">{label}</span>
      <span className="mb-1 min-w-4 flex-1 border-b border-dotted border-current opacity-40" />
      <span className="shrink-0 tabular-nums">{amount}</span>
      {ticked !== undefined && (
        <CheckIcon
          aria-hidden
          className={cn(
            "size-5 shrink-0 self-center text-primary",
            ticked
              ? "motion-safe:animate-[promo-pop_0.5s_cubic-bezier(0.2,0.9,0.3,1.2)_both] motion-safe:[animation-delay:150ms]"
              : "invisible"
          )}
        />
      )}
    </li>
  )
}
