import { RssIcon } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { JsonLd } from "@/components/common/json-ld"
import { NewsList } from "@/features/news/components/news-list"
import { KeepAcronyms } from "@/components/common/keep-acronyms"
import { Button } from "@/components/ui/button"
import { DEFAULT_LOCALE } from "@/config/i18n"
import { PAGE_SIZE } from "@/config/lists"
import { NEWS_FEED } from "@/config/seo"
import { localizedPath } from "@/lib/locale-path"
import { newsPosts } from "@/lib/news-posts"
import { pageMetadata, siteUrl, urlLocale } from "@/lib/site"
import { newsData } from "@/lib/structured-data"
import { PageKey } from "@/components/common/page-key"

/** The page's own address, or its feed's, in the language of the address it was asked for. */
async function ownPath(path: string) {
  return localizedPath((await urlLocale()) ?? DEFAULT_LOCALE, path)
}

export async function generateMetadata() {
  const t = await getTranslations("news")
  const nav = await getTranslations("nav")
  const metadata = await pageMetadata(
    nav("news"),
    t("metaDescription"),
    "/news",
    true
  )

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      types: { "application/rss+xml": await ownPath(NEWS_FEED) },
    },
  }
}

/** testee's news, newest first, in the page's language: posts are written in English and
 * translated after they're saved; one not translated yet shows in English. The first page is
 * rendered here, for search engines, read fresh so a change shows at once. */
export default async function NewsPage() {
  const t = await getTranslations("news")
  const first = await newsPosts(0, PAGE_SIZE)
  const feed = await ownPath(NEWS_FEED)
  const blog = newsData(
    siteUrl(),
    {
      title: t("title"),
      description: t("metaDescription"),
      path: await ownPath("/news"),
      language: await getLocale(),
    },
    first
  )

  return (
    <main className="mx-auto max-w-page space-y-8 px-6 py-12">
      <PageKey page="news" />
      <JsonLd data={blog} />
      {/* The title and its line on the left, the feed on the right, as a list page's action; on
          phones the button takes its own line. */}
      <div className="flex items-center gap-6 max-sm:flex-col max-sm:items-stretch">
        <div className="min-w-0 flex-1 space-y-2">
          <h1 className="font-heading text-3xl font-medium tracking-tight">
            {t("title")}
          </h1>
          <p className="text-base text-muted-foreground">{t("description")}</p>
        </div>
        <Button
          variant="outline"
          className="h-12 shrink-0 px-5 text-base"
          render={<a href={feed} />}
          nativeButton={false}
        >
          <RssIcon aria-hidden />
          <KeepAcronyms text={t("rss")} />
        </Button>
      </div>
      <NewsList initial={first} />
    </main>
  )
}
