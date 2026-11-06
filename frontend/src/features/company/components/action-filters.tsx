"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

import { DayField } from "@/components/common/day-field"
import { PillSelect } from "@/components/common/pill-select"
import { Button } from "@/components/ui/button"
import { ACTION_FILTERS } from "@/config/action-log"
import { dayStart, today } from "@/lib/format"
import type { CompanyMember } from "@/types/company"

// "Anyone" in the menu.
const ANY = "any"

/** The action log's filters: a member and the days from and to (the viewer's own days, sent as
 * the moments they start and end), and Clear while any filter is on, the group's pills too. The
 * choice lives in the address, so the server renders the first page filtered. */
export function ActionFilters({ members }: { members: CompanyMember[] }) {
  const t = useTranslations("actionLog")
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const from = searchParams.get("from")
  // The last day shown: the one before the moment `to` (its end).
  const to = searchParams.get("to")

  function choose(name: string, value: string | null) {
    const params = new URLSearchParams(searchParams)

    if (value === null || value === ANY) {
      params.delete(name)
    } else {
      params.set(name, value)
    }

    router.replace(`${pathname}?${params}`, { scroll: false })
  }

  return (
    <div
      className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr_auto]"
      data-testid="action-filters"
    >
      <PillSelect
        label={t("member")}
        value={searchParams.get("member_id") ?? ANY}
        options={[
          { value: ANY, label: t("anyMember") },
          ...members.map((member) => ({
            value: member.id,
            label: member.email,
          })),
        ]}
        onChange={(value) => choose("member_id", value)}
      />
      <DayField
        label={t("from")}
        value={from ? today(new Date(from)) : ""}
        onChange={(day) => choose("from", day ? dayStart(day) : null)}
      />
      <DayField
        label={t("to")}
        value={to ? today(new Date(new Date(to).getTime() - 1)) : ""}
        onChange={(day) => choose("to", day ? dayStart(day, 1) : null)}
      />
      {ACTION_FILTERS.some((name) => searchParams.has(name)) && (
        <Button
          variant="ghost"
          className="h-14 px-4 text-base"
          data-testid="clear-filters"
          render={<Link href={pathname} scroll={false} />}
          nativeButton={false}
        >
          {t("clear")}
        </Button>
      )}
    </div>
  )
}
