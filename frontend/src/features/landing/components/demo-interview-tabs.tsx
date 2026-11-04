"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"

import { MenuCount } from "@/components/common/menu-count"
import { CURRENT_TAB } from "@/config/tab-nav"

const TABS = ["topics", "candidates", "notes", "settings"] as const

/** An interview's tabs as the site's tabs show them (components/common/tab-nav.tsx), for the
 * landing: topics, candidates and notes with their `counts`, and settings with `settings`, the
 * `current` one open; each is the pointer's "<tab>Tab" ("notesTab"). */
export function DemoInterviewTabs({
  current,
  counts,
  settings = false,
}: {
  current: (typeof TABS)[number]
  counts: Partial<Record<(typeof TABS)[number], number>>
  settings?: boolean
}) {
  const t = useTranslations("interviews")
  const labels = {
    topics: t("topicsTab"),
    candidates: t("candidates"),
    notes: t("notes"),
    settings: t("settings"),
  }

  return (
    <span className="flex gap-6 border-b px-1">
      {TABS.filter((tab) => settings || tab !== "settings").map((tab) => (
        <span
          key={tab}
          data-demo-target={`${tab}Tab`}
          className={cn(
            "-mb-px flex items-center gap-2 border-b-2 pb-2 text-base whitespace-nowrap lowercase",
            tab === current
              ? CURRENT_TAB
              : "border-transparent text-muted-foreground"
          )}
        >
          {labels[tab]}
          <MenuCount count={counts[tab]} />
        </span>
      ))}
    </span>
  )
}
