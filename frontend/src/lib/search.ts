import { SEARCH_RESULTS } from "@/config/search"
import { PUBLIC_TEMPLATES_PATH } from "@/config/lists"
import { apiFetch } from "@/lib/api"
import type { OwnResult, SearchResult, SiteResult } from "@/types/search"
import type { TemplateSummary } from "@/types/superadmin"

/** Where a company, interview or candidate of the user's opens. */
function ownPath(result: OwnResult) {
  const company = `/companies/${result.company_id}/interviews`

  if (result.kind === "company") {
    return company
  }

  const interview = `${company}/${result.interview_id}`

  return result.kind === "interview"
    ? interview
    : `${interview}/candidates/${result.invite_id}`
}

/** What the header's search finds for `q`, in the order the services rank it: the signed-in
 * user's companies, interviews and candidates first, then the site's pages, then the skills tests
 * in the interface's language or English; at most SEARCH_RESULTS. A source that fails is left
 * out. */
export async function searchSite(q: string, locale: string, signedIn: boolean) {
  const query = encodeURIComponent(q)
  const languages = [...new Set([locale, "en"])]
    .map((language) => `&language=${language}`)
    .join("")
  const [own, site, tests] = await Promise.all([
    signedIn
      ? apiFetch<OwnResult[]>(`/companies/search?q=${query}`).catch(() => [])
      : [],
    apiFetch<SiteResult[]>(`/site/search?q=${query}`).catch(() => []),
    apiFetch<TemplateSummary[]>(
      `${PUBLIC_TEMPLATES_PATH}?q=${query}&limit=${SEARCH_RESULTS}${languages}`
    ).catch(() => []),
  ])
  const found: SearchResult[] = [
    ...own.map((item) => ({
      key: `${item.kind}:${item.invite_id ?? item.interview_id ?? item.company_id}`,
      kind: item.kind,
      title: item.title,
      path: ownPath(item),
      context:
        item.kind === "company"
          ? undefined
          : [item.company, item.interview ?? ""].filter(Boolean),
    })),
    ...site.map((item) => ({
      key: `site:${item.path}:${item.title}`,
      ...item,
    })),
    ...tests
      .filter((item) => item.slug)
      .map((item) => ({
        key: `test:${item.slug}`,
        kind: "test" as const,
        title: item.title,
        path: `/tests/${item.slug}`,
      })),
  ]

  return found.slice(0, SEARCH_RESULTS)
}
