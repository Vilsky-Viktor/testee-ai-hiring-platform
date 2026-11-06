"use client"

import { useFormatter } from "next-intl"

import { Badge } from "@/components/ui/badge"

// In a selected or hovered menu item: filled, a small step darker than the item in the light theme
// and the same small step lighter in the dark one.
const FILLED =
  "in-[:is([aria-current=page],[aria-selected=true],a:hover,button:hover)]:border-transparent in-[:is([aria-current=page],[aria-selected=true],a:hover,button:hover)]:bg-[color-mix(in_oklch,var(--surface),var(--input))] dark:in-[:is([aria-current=page],[aria-selected=true],a:hover,button:hover)]:bg-input/40"

/** How many things a menu page holds (an interview's notes), after its name; nothing at 0. */
export function MenuCount({ count }: { count?: number }) {
  const format = useFormatter()

  if (!count) {
    return null
  }

  return (
    <Badge
      variant="outline"
      className={`tabular-nums ${FILLED}`}
      data-testid="menu-count"
    >
      {format.number(count)}
    </Badge>
  )
}
