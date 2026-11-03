import { getTranslations } from "next-intl/server"

import { SearchField } from "@/components/common/search-field"
import { MAX_SEARCH_LENGTH } from "@/config/limits"

/** Searches a company's interviews by title as you type, like the templates and candidates
 * searches; the address keeps the search (`?q=`). */
export async function InterviewSearch({ q }: { q: string }) {
  const t = await getTranslations("interviews")

  return <SearchField q={q} label={t("search")} maxLength={MAX_SEARCH_LENGTH} />
}
