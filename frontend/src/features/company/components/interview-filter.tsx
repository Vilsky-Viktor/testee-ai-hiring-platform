import { getTranslations } from "next-intl/server"

import { FilterPills } from "@/components/common/filter-pills"
import type { InterviewStatusCounts } from "@/types/company"

const STATES = ["new", "in_process", "hired"] as const

/** Pills narrowing a company's interviews to a status (`?status=`, kept with the search), each
 * with how many there are; the address keeps the choice. */
export async function InterviewFilter({
  href,
  q,
  status,
  counts,
}: {
  href: string
  q: string
  status: string
  counts: InterviewStatusCounts
}) {
  const t = await getTranslations("interviews")
  const names = await getTranslations("interviewStatus")
  const pills = [
    { id: "", label: t("allStatuses"), count: counts.all },
    ...STATES.map((id) => ({ id, label: names(id), count: counts[id] })),
  ]

  return (
    <FilterPills
      testId="interview-filter"
      items={pills.map(({ id, label, count }) => {
        const query = new URLSearchParams({
          ...(q && { q }),
          ...(id && { status: id }),
        }).toString()

        return {
          id: id || "all",
          label,
          count,
          chosen: id === status,
          href: query ? `${href}?${query}` : href,
        }
      })}
    />
  )
}
