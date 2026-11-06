import { cn } from "cn"
import Link from "next/link"

import { ShortNumber } from "@/components/common/short-number"
import { PILL, PILL_CHOSEN } from "@/config/pills"

/** A list's filters as pills, each a link the address keeps, with how many it has when known. */
export function FilterPills({
  items,
  testId,
}: {
  items: {
    id: string
    label: string
    href: string
    chosen: boolean
    count?: number
  }[]
  testId?: string
}) {
  return (
    <div className="flex flex-wrap gap-2" data-testid={testId}>
      {items.map(({ id, label, href, chosen, count }) => (
        <Link
          key={id}
          href={href}
          aria-current={chosen ? "true" : undefined}
          className={cn(PILL, "flex items-center gap-2", chosen && PILL_CHOSEN)}
        >
          {label}
          {count !== undefined && (
            <span className="tabular-nums">
              <ShortNumber value={count} />
            </span>
          )}
        </Link>
      ))}
    </div>
  )
}
