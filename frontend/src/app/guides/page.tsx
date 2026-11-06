import { BookOpenIcon } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { ContentList } from "@/features/content/components/content-list"
import { contentPages } from "@/lib/content"
import { pageMetadata } from "@/lib/site"
import { PageKey } from "@/components/common/page-key"
import { SearchField } from "@/components/common/search-field"
import { SearchedList } from "@/components/common/searched-list"
import { LIST_EMPTY } from "@/config/lists"
import {
  MAX_SITE_SEARCH_LENGTH,
  MAX_SITE_SEARCH_RESULTS,
} from "@/config/search"
import { publicFetch } from "@/lib/server-api"
import type { SiteResult } from "@/types/search"

export async function generateMetadata() {
  const t = await getTranslations("guides")

  return pageMetadata(t("title"), t("intro"), "/guides", true)
}

/** The guides hub: every page in content/guides, by title, or, with a search (`?q=`, as you
 * type), the guides site's search finds, best first. */
export default async function HubPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const t = await getTranslations("guides")
  const q = (await searchParams).q?.trim() ?? ""
  // In the interface's language where translated.
  const [pages, found] = await Promise.all([
    contentPages("guides", await getLocale()),
    q
      ? publicFetch<SiteResult[]>(
          `/site/search?kind=guide&limit=${MAX_SITE_SEARCH_RESULTS}&q=${encodeURIComponent(q)}`
        )
      : null,
  ])
  const shown = found
    ? found.flatMap((result) =>
        pages.filter((page) => `/guides/${page.slug}` === result.path)
      )
    : pages

  return (
    <main className="mx-auto max-w-page space-y-8 px-6 py-12">
      <PageKey page="guides" />
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-medium tracking-tight">
          {t("title")}
        </h1>
        <p className="text-base text-muted-foreground">{t("intro")}</p>
      </div>
      <SearchedList>
        <SearchField
          q={q}
          label={t("search")}
          maxLength={MAX_SITE_SEARCH_LENGTH}
        />
        {shown.length > 0 ? (
          <ContentList pages={shown} base="/guides" icon={BookOpenIcon} />
        ) : (
          <p className={LIST_EMPTY}>{t("noMatches")}</p>
        )}
      </SearchedList>
    </main>
  )
}
