import { cn } from "cn"
import { getLocale, getTranslations } from "next-intl/server"

import { BackLink } from "@/components/common/back-link"
import { LocalizedLink } from "@/components/common/localized-link"
import { Markdown } from "@/components/common/markdown"
import { StartCard } from "@/features/content/components/start-card"
import { JsonLd } from "@/components/common/json-ld"
import { PageKey } from "@/components/common/page-key"
import { Button } from "@/components/ui/button"
import { CARD } from "@/config/cards"
import { DEFAULT_LOCALE } from "@/config/i18n"
import { TEXT_LINK } from "@/config/links"
import type { ContentPage } from "@/lib/content"
import { formatDay } from "@/lib/format"
import { headingId, sectionTitles } from "@/lib/headings"
import { textDirection } from "@/lib/locale"
import { localizeHref } from "@/lib/locale-path"
import { endsWithQuestionMark } from "@/lib/question-mark"
import { previewImage, siteUrl, urlLocale } from "@/lib/site"
import { articleData, breadcrumbData } from "@/lib/structured-data"
import type { PageHelpKey } from "@/types/page-help"

// How many sections an article has before it lists them at its top.
const MIN_CONTENTS = 3

/** One content page (a category page, a comparison or a guide): its heading, the way to a first
 * test, its date, the list of its sections and its text, then that way to a first test again, in the language it's written in (English where it has no
 * translation yet, with a note). `section` is the hub it belongs to, for the back link and the
 * breadcrumb; `pageKey`, its guide's key. */
export async function ContentArticle({
  page,
  path,
  pageKey,
  section,
}: {
  page: ContentPage
  path: string
  pageKey: PageHelpKey
  section?: { name: string; path: string }
}) {
  const t = await getTranslations("content")
  const locale = await getLocale()
  const titles = sectionTitles(page.body)
  const address = await urlLocale()
  // The breadcrumb names the addresses in the page's own language.
  const steps = [
    { name: "testee", path: "/" },
    ...(section ? [section] : []),
    { name: page.title, path },
  ].map((step) => ({ ...step, path: localizeHref(address, step.path) }))

  return (
    <main className="mx-auto max-w-page space-y-10 px-6 py-12">
      <PageKey page={pageKey} />
      <JsonLd
        data={[
          articleData(siteUrl(), {
            ...page,
            // Its canonical address: the English one while it isn't translated.
            path:
              page.language === (address ?? DEFAULT_LOCALE)
                ? localizeHref(address, path)
                : path,
            // The page's link preview picture (lib/site.ts pageMetadata).
            image: previewImage(page.seoTitle, address ?? DEFAULT_LOCALE)[0]
              .url,
          }),
          breadcrumbData(siteUrl(), steps),
        ]}
      />
      <header className="mx-auto max-w-5xl space-y-4">
        {/* The way back beside the title, as on the app's pages: to the article's section, or
            home for a page without one. */}
        <div className="relative">
          {section ? (
            <BackLink href={section.path}>{section.name}</BackLink>
          ) : (
            <BackLink href="/">{null}</BackLink>
          )}
          <h1
            className={cn(
              "font-heading text-4xl font-medium tracking-tight text-balance normal-case",
              endsWithQuestionMark(page.title) && "no-dot"
            )}
          >
            {page.title}
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">{page.description}</p>
        <Button
          className="h-12 px-6 text-base max-sm:w-full"
          data-testid="article-start"
          render={<LocalizedLink href="/" />}
          nativeButton={false}
        >
          {t("startButton")}
        </Button>
        <p className="text-sm text-muted-foreground">
          {page.language !== locale && (
            <span className="block pb-2">{t("englishOnly")}</span>
          )}
          {/* The date line in italics. */}
          <span className="italic">
            {t("updated")}{" "}
            <time dateTime={page.updated}>
              {/* At midday UTC, so the day is the same in any time zone. */}
              {formatDay(page.updated, locale)}
            </time>
          </span>
        </p>
      </header>
      {titles.length >= MIN_CONTENTS && (
        <nav
          aria-label={t("contents")}
          data-testid="article-contents"
          className={`mx-auto max-w-5xl space-y-3 ${CARD}`}
        >
          <h2 className="font-heading text-lg font-medium">{t("contents")}</h2>
          <ul
            lang={page.language}
            dir={textDirection(page.language)}
            className="grid gap-x-8 gap-y-2 sm:grid-cols-2"
          >
            {titles.map((title) => (
              <li key={title}>
                <a href={`#${headingId(title)}`} className={TEXT_LINK}>
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <article
        lang={page.language}
        dir={textDirection(page.language)}
        className="mx-auto max-w-5xl space-y-5"
      >
        <Markdown text={page.body} article />
      </article>
      <StartCard />
    </main>
  )
}
