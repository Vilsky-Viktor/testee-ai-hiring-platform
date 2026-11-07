import { notFound } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"

import { SearchField } from "@/components/common/search-field"
import { SearchedList } from "@/components/common/searched-list"
import {
  TemplateFilterBar,
  type TemplateChoice,
} from "@/features/templates/components/template-filters"
import { TemplateList } from "@/features/templates/components/template-list"
import { TemplatePager } from "@/features/templates/components/template-pager"
import { DEFAULT_LOCALE } from "@/config/i18n"
import { MAX_TITLE_LENGTH } from "@/config/limits"
import {
  PAGE_SIZE,
  PUBLIC_TEMPLATES_HUB_PATH,
  PUBLIC_TEMPLATES_PATH,
} from "@/config/lists"
import { publicFetch, serverFetch } from "@/lib/server-api"
import {
  hubPage,
  templateChoice,
  templateQuery,
} from "@/features/templates/utils/templates"
import type { PracticeStatus } from "@/types/round"
import type {
  TemplateCount,
  TemplateFilters,
  TemplateSummary,
} from "@/types/superadmin"

export type TemplateSearchParams = {
  q?: string
  level?: string
  lang?: string | string[]
  page?: string
}

/** The rows a list starts with (the rest load as the user scrolls), the API list they're from,
 * and for a public hub its numbered page and how many there are; a page past the last isn't
 * found. The public catalog is the same for everyone, so it's read without the visitor's token,
 * and fresh: a template published or removed shows at once. The others are the visitor's own. */
async function readList(
  listPath: string,
  choice: TemplateChoice,
  languageAsked: boolean,
  params: TemplateSearchParams
) {
  const isPublic = listPath === PUBLIC_TEMPLATES_PATH
  const query = templateQuery(choice)
  const hub = isPublic && !choice.q && !choice.level && !languageAsked
  const path = `${hub ? PUBLIC_TEMPLATES_HUB_PATH : listPath}?${query}`
  const page = hub ? hubPage(params) : 1
  const firstPath = `${path}&limit=${PAGE_SIZE}&offset=${(page - 1) * PAGE_SIZE}`
  const countPath = `${PUBLIC_TEMPLATES_HUB_PATH}/count?${query}`
  const [first, count] = await Promise.all([
    isPublic
      ? publicFetch<TemplateSummary[]>(firstPath, { fresh: true })
      : serverFetch<TemplateSummary[]>(firstPath),
    hub ? publicFetch<TemplateCount>(countPath, { fresh: true }) : null,
  ])

  if (page > 1 && !first?.length) {
    notFound()
  }

  return {
    path,
    page,
    first,
    pages: Math.ceil((count?.count ?? 0) / PAGE_SIZE),
  }
}

/** The templates searched and filtered like the old public library, on the page at `base` (the
 * address keeps the choices). `listPath` is the API list; rows open under `openBase` (by their
 * readable slug with `bySlug`, the public practice pages), and carry a "Use template" button for
 * `companyId`. Until a language is chosen, the list shows the visitor's interface language and
 * English (every language with `allLanguages`, the admin zone's). `statuses` marks the templates
 * the signed-in talent practiced. The public catalog before any search or filter is a hub for
 * search engines: only indexable templates, by title, with `?page=N` links under them and every
 * row on the server; people still scroll on from its first page. Null when the list can't be
 * read. */
export async function TemplateBrowser({
  base,
  listPath,
  params,
  openBase,
  companyId,
  bySlug,
  allLanguages,
  statuses,
  topicsLine,
}: {
  base: string
  listPath: string
  params: TemplateSearchParams
  openBase: string
  companyId?: string
  bySlug?: boolean
  allLanguages?: boolean
  statuses?: PracticeStatus[]
  // Rows say how many topics each has in words, not when it was made.
  topicsLine?: boolean
}) {
  const t = await getTranslations("templates")
  // The filters are the same for everyone: kept a while.
  const filters = await publicFetch<TemplateFilters>(
    "/library/templates/filters"
  )

  if (!filters) {
    return null
  }

  const asked = [params.lang ?? []].flat()
  // Nothing chosen yet: the visitor's own language and English, unless every language is asked.
  const preferred =
    asked.length > 0 || allLanguages
      ? asked
      : [await getLocale(), DEFAULT_LOCALE]
  const choice = templateChoice(params, asked, preferred, filters)
  const narrowed = Boolean(choice.q || choice.level || choice.languages.length)
  const { path, page, first, pages } = await readList(
    listPath,
    choice,
    asked.length > 0,
    params
  )

  if (!first) {
    return null
  }

  return (
    <>
      <SearchedList>
        <SearchField
          q={choice.q}
          label={t("search")}
          maxLength={MAX_TITLE_LENGTH}
          // The level and languages sit inside the field; a new search keeps them.
          addon={
            <TemplateFilterBar base={base} filters={filters} current={choice} />
          }
        />

        <TemplateList
          // A page link starts the list over.
          key={page}
          path={path}
          initial={first}
          empty={narrowed ? t("noMatches") : t("empty")}
          openBase={openBase}
          companyId={companyId}
          bySlug={bySlug}
          statuses={statuses}
          topicsLine={topicsLine}
          scrollsOn={page === 1}
        />
      </SearchedList>
      <TemplatePager base={base} current={page} pages={pages} />
    </>
  )
}
