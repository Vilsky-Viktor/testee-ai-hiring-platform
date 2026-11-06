"use client"

import { cn } from "cn"
import {
  CompassIcon,
  ListChecksIcon,
  NotebookPenIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"

import { MenuCount } from "@/components/common/menu-count"

const TABS = ["topics", "candidates", "notes", "discover", "settings"] as const
const ICONS = {
  topics: ListChecksIcon,
  candidates: UsersIcon,
  notes: NotebookPenIcon,
  discover: CompassIcon,
  settings: SettingsIcon,
}

/** An interview's menu as the site's side menu shows it (components/common/side-menu.tsx), every
 * page of it, for the landing: the `current` one on a grey row, with their `counts`; each is the
 * pointer's "<tab>Tab" ("notesTab"). */
export function DemoInterviewTabs({
  current,
  counts,
}: {
  current: (typeof TABS)[number]
  counts: Partial<Record<(typeof TABS)[number], number>>
}) {
  const t = useTranslations("interviews")
  const labels = {
    topics: t("topicsTab"),
    candidates: t("candidates"),
    notes: t("notes"),
    discover: t("discover"),
    settings: t("settings"),
  }

  return (
    <span className="flex w-48 shrink-0 flex-col gap-1">
      {TABS.map((tab) => {
        const Icon = ICONS[tab]
        const open = tab === current

        return (
          <span
            key={tab}
            data-demo-target={`${tab}Tab`}
            aria-current={open ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2 text-base lowercase",
              open ? "bg-surface text-foreground" : "text-muted-foreground"
            )}
          >
            <Icon
              aria-hidden
              className={cn("size-5 shrink-0", open && "text-primary")}
            />
            <span className="min-w-0 flex-1 whitespace-nowrap">
              {labels[tab]}
              <span className="blue-dot">.</span>
            </span>
            <MenuCount count={counts[tab]} />
          </span>
        )
      })}
    </span>
  )
}
