"use client"

import { cn } from "cn"
import { SparklesIcon } from "lucide-react"
import { useTranslations } from "next-intl"

/** Who's speaking at the start of one of the assistant's replies: its sparkle and name; the
 * sparkle pulses softly while it's `working`. */
export function MiraName({ working = false }: { working?: boolean }) {
  const t = useTranslations("assistant")

  return (
    <p className="flex items-center gap-1.5 text-sm font-medium">
      <SparklesIcon
        aria-hidden
        className={cn("size-4 text-primary", working && "animate-pulse")}
      />
      {t("name")}
    </p>
  )
}
