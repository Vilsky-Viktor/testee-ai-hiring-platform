import { cookies } from "next/headers"
import { notFound, permanentRedirect } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"

import { BackLink } from "@/components/common/back-link"
import { Count } from "@/components/common/count"
import { JsonLd } from "@/components/common/json-ld"
import { PageHeader } from "@/components/common/page-header"
import { HireWithTemplate } from "@/features/practice/components/hire-with-template"
import { PracticeActions } from "@/features/practice/components/practice-actions"
import { ShortNumber } from "@/components/common/short-number"
import { SubtopicList } from "@/components/common/subtopic-list"
import { SummaryCards } from "@/components/common/summary-cards"
import { InfoCard } from "@/components/common/warning-card"
import { Progress } from "@/components/ui/progress"
import { TOKEN_COOKIE } from "@/config/auth"
import { DEFAULT_LOCALE } from "@/config/i18n"
import { textDirection } from "@/lib/locale"
import { localizedPath, templateLocales } from "@/lib/locale-path"
import { hasMessage } from "@/lib/messages"
import { pageMetadata, siteUrl, urlLocale } from "@/lib/site"
import { publicFetch, serverFetch } from "@/lib/server-api"
import { breadcrumbData } from "@/lib/structured-data"
import type { PracticeSize, PracticeTopicProgress } from "@/types/round"
import type { Template } from "@/types/superadmin"
import { LIST_BOX, ROW_HOVER, ROW_ICON } from "@/config/lists"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const t = await getTranslations("practice")
  const tLevel = await getTranslations("templates.levels")
  const template = await publicFetch<Template>(`/library/templates/${id}`, {
    required: true,
  })

  if (!template) {
    return {}
  }

  return {
    ...(await pageMetadata(
      t("pageTitle", { title: template.title }),
      t("pageDescription", {
        title: template.title,
        level: hasMessage(tLevel, template.level)
          ? tLevel(template.level)
          : template.level,
        count: template.topic_count,
      }),
      `/practice/${template.slug ?? template.id}`,
      templateLocales(template.language)
    )),
    // Kept out of search results when the API says it's too thin or a near-duplicate.
    robots: template.indexable ? undefined : { index: false },
  }
}

/** One free practice test, public for search engines: the role, its facts, and the topics it
 * covers. Its questions are never shown here. Its address is the template's slug;
 * an old address by id moves there for good. */
export default async function PracticeTestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: key } = await params
  const t = await getTranslations("practice")
  const tLevel = await getTranslations("templates.levels")
  const signedIn = (await cookies()).has(TOKEN_COOKIE)
  const template = await publicFetch<Template>(`/library/templates/${key}`, {
    required: true,
  })

  const locale = await urlLocale()
  const pageLocale = await getLocale()

  // Links stay in the language of the page's address (/de/practice/… leads to /de/…).
  const at = (path: string) => localizedPath(locale ?? DEFAULT_LOCALE, path)

  // Only English and the template's own language have this page.
  if (!template || (locale && locale !== template.language)) {
    notFound()
  }

  if (template.slug && key !== template.slug) {
    permanentRedirect(at(`/practice/${template.slug}`))
  }

  const id = template.id
  const [size, progress] = await Promise.all([
    publicFetch<PracticeSize>(`/rounds/practice/${id}/size`),
    // The talent's latest score on each topic; nothing before their first round.
    signedIn
      ? serverFetch<PracticeTopicProgress[]>(`/rounds/practice/${id}/progress`)
      : null,
  ])

  const reached = new Map((progress ?? []).map((item) => [item.topic_id, item]))

  return (
    <main className="mx-auto max-w-page space-y-8 px-6 py-12">
      <JsonLd
        data={breadcrumbData(siteUrl(), [
          { name: "testee", path: at("/") },
          { name: t("title"), path: at("/practice") },
          {
            name: template.title,
            path: at(`/practice/${template.slug ?? id}`),
          },
        ])}
      />
      <PageHeader
        back={
          <BackLink href="/practice" help="practiceTest">
            {t("title")}
          </BackLink>
        }
        // On phones the actions come after the title, on a line of their own.
        title={
          <div className="flex items-start justify-between gap-4 max-sm:flex-wrap">
            <div className="min-w-0 flex-1">
              <h1 className="font-heading text-3xl font-medium tracking-tight text-balance normal-case">
                {template.title}
              </h1>
            </div>
            <div className="max-sm:flex max-sm:basis-full max-sm:justify-center max-sm:pt-2">
              <PracticeActions
                templateId={id}
                startLabel={t("start")}
                timings={size?.timings ?? []}
              />
            </div>
          </div>
        }
      />

      <SummaryCards
        testId="practice-facts"
        className="max-sm:*:last:col-span-1 lg:grid-cols-4"
        rows={[
          {
            id: "topics",
            label: t("facts.topics"),
            value: template.topics.length,
          },
          ...(size
            ? [
                {
                  id: "questions",
                  label: t("facts.questions"),
                  value: <ShortNumber value={size.questions} />,
                },
              ]
            : []),
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
        ]}
      />
      <InfoCard className="max-sm:-mx-6 max-sm:rounded-none">
        {t("about")}
      </InfoCard>

      <ul
        lang={template.language}
        dir={textDirection(template.language)}
        className={`${LIST_BOX} overflow-hidden`}
      >
        {template.topics.map((topic, index) => {
          const step = reached.get(topic.id)

          return (
            <li
              key={topic.id}
              className={`group/row flex items-start gap-4 p-6 ${ROW_HOVER}`}
            >
              <span aria-hidden className={`${ROW_ICON} font-medium`}>
                {index + 1}
              </span>
              <span className="block min-w-0 flex-1 space-y-3">
                <span className="block text-lg font-medium">{topic.title}</span>
                <SubtopicList subtopics={topic.subtopics} />
                {/* Signed in: how far their latest round got on the topic, 0 of the topic's
                    questions before it's started. */}
                {signedIn && (
                  <span className="flex items-center gap-4">
                    <Progress
                      aria-label={topic.title}
                      value={step ? (step.answered / step.total) * 100 : 0}
                      className="flex-1"
                    />
                    <span className="shrink-0 text-base text-muted-foreground tabular-nums">
                      <Count
                        done={step?.answered ?? 0}
                        total={step?.total ?? size?.topics?.[topic.id] ?? 0}
                      />
                    </span>
                  </span>
                )}
              </span>
            </li>
          )
        })}
      </ul>

      {/* Visitors who hire for this role can create an interview for their own candidates. */}
      <HireWithTemplate templateId={template.id} />
    </main>
  )
}
