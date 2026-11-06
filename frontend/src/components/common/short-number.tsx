"use client"

import { useLocale } from "next-intl"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SHORT_NUMBER_FROM } from "@/config/lists"
import { compactNumber } from "@/lib/format"

/** A number as the site shows it: from 1,000 up short ("37.5K"), the whole number in a tooltip. */
export function ShortNumber({ value }: { value: number }) {
  const locale = useLocale()

  if (value < SHORT_NUMBER_FROM) {
    return value.toLocaleString(locale)
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<span />}>
        {compactNumber(value, locale)}
      </TooltipTrigger>
      <TooltipContent data-testid="short-number-tooltip">
        {value.toLocaleString(locale)}
      </TooltipContent>
    </Tooltip>
  )
}
