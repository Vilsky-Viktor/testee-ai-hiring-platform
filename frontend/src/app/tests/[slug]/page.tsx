import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"

import { BackLink } from "@/components/common/back-link"
import { FaqList } from "@/components/common/faq-list"
import { JsonLd } from "@/components/common/json-ld"
import { PageHeader } from "@/components/common/page-header"
import { SubtopicList } from "@/components/common/subtopic-list"
import { SummaryCards } from "@/components/common/summary-cards"
import { SampleQuestions } from "@/features/tests/components/sample-questions"
import { Button } from "@/components/ui/button"
import { DEFAULT_LOCALE } from "@/config/i18n"
import { ROLE_PAGE_FAQ } from "@/config/role-tests"
import { bdi } from "@/lib/bidi"
import { publicFetch } from "@/lib/server-api"
import { textDirection } from "@/lib/locale"
import { localizedPath, templateLocales } from "@/lib/locale-path"
import { hasMessage } from "@/lib/messages"
import { pageMetadata, siteUrl, urlLocale } from "@/lib/site"
import { breadcrumbData } from "@/lib/structured-data"
import {
  countryCatalog,
  faqPath,
  priceValues,
  visitorCatalog,
} from "@/lib/catalog"
import type { FaqItem } from "@/types/help"
import type { SampleQuestion, Template } from "@/types/superadmin"
import { CARD } from "@/config/cards"
import { LIST_BOX, ROW_HOVER, ROW_ICON } from "@/config/lists"
import { PageKey } from "@/components/common/page-key"

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params) {
  const { slug } = await params
  const t = await getTranslations("tests")
  const [template, catalog] = await Promise.all([
    publicFetch<Template>(`/library/templates/${slug}`, {
      required: true,
    }),
    countryCatalog(),
  ])

  if (!template) {
    return {}
  }

  return {
    ...(await pageMetadata(
      t("pageTitle", { role: template.title }),
      t("pageDescription", {
        role: template.title,
        count: template.topic_count,
        ...(await priceValues(catalog)),
      }),
      `/tests/${template.slug ?? template.id}`,
      templateLocales(template.language)
    )),
    // Kept out of search results when the API says it's too thin or a near-duplicate.
    robots: template.indexable ? undefined : { index: false },
  }
}

/** A role's skills test for companies hiring for it, made from its template: its facts, what it
 * checks, the way to test candidates, and sample questions (which also answer candidates' searches,
 * with a link to free practice). Its address is the template's slug. */
export default async function RoleTestPage({ params }: Params) {
  const { slug: key } = await params
  const t = await getTranslations("tests")
  const tLevel = await getTranslations("templates.levels")
  // Asked together: the template, the price per candidate in the visitor's currency, and the
  // site FAQ's answers to what companies ask before testing candidates, in the page's language
  // and with today's prices (left out while prices can't be read: rounds refuses).
  const [template, catalog, answers] = await Promise.all([
    publicFetch<Template>(`/library/templates/${key}`, {
      required: true,
    }),
    visitorCatalog(),
    faqPath()
      .then((path) => publicFetch<FaqItem[]>(path))
      .catch(() => null),
  ])

  const locale = await urlLocale()
  const pageLocale = await getLocale()

  // Links stay in the language of the page's address (/de/tests/… leads to /de/…).
  const at = (path: string) => localizedPath(locale ?? DEFAULT_LOCALE, path)

  // Only English and the template's own language have this page.
  if (!template || (locale && locale !== template.language)) {
    notFound()
  }

  if (template.slug && key !== template.slug) {
    permanentRedirect(at(`/tests/${template.slug}`))
  }

  const slug = template.slug ?? template.id
  const prices = await priceValues(catalog)
  const questions =
    (await publicFetch<SampleQuestion[]>(
      `/library/templates/${slug}/sample`
    )) ?? []
  const faq = (answers ?? []).filter((item) => ROLE_PAGE_FAQ.includes(item.key))

  return (
    <main className="mx-auto max-w-page space-y-10 px-6 py-12">
      <PageKey page="test" />
      <JsonLd
        data={breadcrumbData(siteUrl(), [
          { name: "testee", path: at("/") },
          { name: t("title"), path: at("/tests") },
          { name: template.title, path: at(`/tests/${slug}`) },
        ])}
      />
      <PageHeader
        back={<BackLink href="/tests">{t("title")}</BackLink>}
        title={
          <h1 className="font-heading text-3xl font-medium tracking-tight text-balance normal-case">
            {t.rich("heading", { role: template.title, ...bdi })}
          </h1>
        }
      />
      <div className="space-y-6">
        <p className="max-w-4xl text-lg text-muted-foreground">
          {t("lead", prices)}
        </p>
        <div className="flex flex-wrap items-center gap-3 max-sm:*:w-full">
          <Button
            className="h-12 px-6 text-base"
            render={<Link href={at("/")} />}
            nativeButton={false}
          >
            {t("create")}
          </Button>
          <Button
            variant="outline"
            className="h-12 px-6 text-base"
            render={<Link href={at(`/practice/${slug}`)} />}
            nativeButton={false}
          >
            {t("practise")}
          </Button>
        </div>
        <SummaryCards
          testId="test-facts"
          className="max-sm:*:last:col-span-1 lg:grid-cols-4"
          rows={[
            {
              id: "topics",
              label: t("facts.topics"),
              value: template.topics.length,
            },
            {
              id: "level",
              label: t("facts.level"),
              value: hasMessage(tLevel, template.level)
                ? tLevel(template.level)
                : template.level,
            },
            {
              id: "language",
              label: t("facts.language"),
              value:
                new Intl.DisplayNames(pageLocale, { type: "language" }).of(
                  template.language
                ) ?? template.language,
            },
            ...(prices.price
              ? [
                  {
                    id: "price",
                    label: t("facts.price"),
                    value: prices.price,
                  },
                ]
              : []),
          ]}
        />
      </div>

      <section className="space-y-4">
        <h2 className="font-heading text-2xl font-medium">{t("topics")}</h2>
        <ul
          lang={template.language}
          dir={textDirection(template.language)}
          className={`${LIST_BOX} overflow-hidden`}
        >
          {template.topics.map((topic, index) => (
            <li
              key={topic.id}
              className={`group/row flex items-start gap-4 p-6 ${ROW_HOVER}`}
            >
              <span aria-hidden className={`${ROW_ICON} font-medium`}>
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 space-y-3">
                <span className="block text-lg font-medium">{topic.title}</span>
                <SubtopicList subtopics={topic.subtopics} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      {questions.length > 0 && (
        <SampleQuestions questions={questions} language={template.language} />
      )}

      {faq.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-heading text-2xl font-medium">{t("faq")}</h2>
          <FaqList items={faq} />
        </section>
      )}

      {/* Having read all that, the way to go on. */}
      <section
        data-testid="test-closing"
        className={`flex items-center justify-between gap-6 max-sm:-mx-6 max-sm:flex-col max-sm:items-stretch max-sm:rounded-none ${CARD}`}
      >
        <div className="min-w-0 space-y-1">
          <h2 className="no-dot font-heading text-2xl font-medium">
            {t("closingTitle")}
          </h2>
          <p className="text-base text-muted-foreground">{t("closingText")}</p>
        </div>
        <Button
          className="h-12 shrink-0 px-6 text-base"
          render={<Link href={at("/")} />}
          nativeButton={false}
        >
          {t("create")}
        </Button>
      </section>
    </main>
  )
}
