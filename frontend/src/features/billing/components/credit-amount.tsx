import { cn } from "cn"

import { ShortNumber } from "@/components/common/short-number"

/** The credits a movement added or took, with its sign. */
export function CreditAmount({ amount }: { amount: number }) {
  return (
    <span
      className={cn(
        "shrink-0 font-heading text-2xl font-medium tabular-nums",
        amount > 0 && "text-primary"
      )}
    >
      {amount > 0 ? "+" : amount < 0 ? "−" : ""}
      <ShortNumber value={Math.abs(amount)} />
    </span>
  )
}
