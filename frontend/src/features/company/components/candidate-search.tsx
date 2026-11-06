import { getTranslations } from "next-intl/server"

import { CandidateSortMenu } from "@/features/company/components/candidate-sort"
import { SearchField } from "@/components/common/search-field"
import type { CandidateSort } from "@/config/interviews"
import { MAX_SEARCH_LENGTH } from "@/config/limits"

/** Searches an interview's candidates by email or name as you type, with the sort inside the
 * field, like the templates search. A new search keeps the tab, sort and status. */
export async function CandidateSearch({
  sort,
  q,
}: {
  sort: CandidateSort
  q: string
}) {
  const t = await getTranslations("candidates")

  return (
    <SearchField
      q={q}
      label={t("search")}
      maxLength={MAX_SEARCH_LENGTH}
      keep={{ tab: "candidates" }}
      addon={<CandidateSortMenu current={sort} />}
    />
  )
}
