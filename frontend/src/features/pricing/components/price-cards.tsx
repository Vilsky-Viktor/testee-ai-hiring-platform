import { cn } from "cn"

import { PRIMARY_FILL } from "@/config/buttons"

// A card of the pricing page, on the phones across the screen with square corners.
const CARD =
  "relative -mx-6 flex flex-col gap-2 bg-surface p-7 text-center transition-colors hover:bg-input sm:mx-0 sm:rounded-xl sm:p-9"

/** What something costs, as a card: its `price` large, in the primary colour when it's `free` or
 * the `best`, and what it's for under it. The `best` one carries its `tag` on its top edge and
 * the primary outline. */
export function PriceCard({
  price,
  what,
  highlighted = false,
  tag,
}: {
  price: string
  what: string
  highlighted?: boolean
  tag?: string
}) {
  return (
    <li className={cn(CARD, tag && "shadow-[inset_0_0_0_1px_var(--primary)]")}>
      {tag && (
        <span
          className={`absolute start-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full px-4 py-1 text-sm font-medium whitespace-nowrap lowercase rtl:translate-x-1/2 ${PRIMARY_FILL}`}
        >
          {tag}
        </span>
      )}
      <span
        className={cn(
          "font-heading text-4xl font-medium tabular-nums sm:text-5xl",
          highlighted && "text-primary"
        )}
      >
        {price}
      </span>
      <span className="text-base text-balance text-muted-foreground">
        {what}
      </span>
    </li>
  )
}
