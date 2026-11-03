import { getTranslations } from "next-intl/server"

import { CandidateSortMenu } from "@/features/company/components/candidate-sort"
import { CandidateStatusFilter } from "@/features/company/components/candidate-status-filter"
import { SearchField } from "@/components/common/search-field"
import type { CandidateSort } from "@/config/interviews"
import { MAX_SEARCH_LENGTH } from "@/config/limits"

/** Searches an interview's candidates by email or name as you type, with the status and result
 * filter and the sort inside the field, like the templates search. A new search keeps the tab,
 * sort and status. */
export async function CandidateSearch({
  sort,
  q,
  status,
  filters,
}: {
  sort: CandidateSort
  q: string
  status: string | null
  filters: string[]
}) {
  const t = await getTranslations("candidates")

  return (
    <SearchField
      q={q}
      label={t("search")}
      maxLength={MAX_SEARCH_LENGTH}
      keep={{ tab: "candidates" }}
      addon={
        <span className="flex shrink-0 items-center gap-1">
          <CandidateStatusFilter filters={filters} current={status} />
          <CandidateSortMenu current={sort} />
        </span>
      }
    />
  )
}
