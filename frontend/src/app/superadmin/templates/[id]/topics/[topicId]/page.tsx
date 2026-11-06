import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { BackLink } from "@/components/common/back-link"
import { PageHeader } from "@/components/common/page-header"
import { SubtopicList } from "@/components/common/subtopic-list"
import { TopicQuestionList } from "@/components/common/topic-question-list"
import { WarningCard } from "@/components/common/warning-card"
import { languageOf } from "@/lib/locale"
import { serverFetch } from "@/lib/server-api"
import { translatedTitle } from "@/lib/site"
import type { PooledTemplate } from "@/types/superadmin"

export const generateMetadata = () => translatedTitle("questions", "manage")

/** One topic of a template, its questions on their own page: check, re-generate or mark them. */
export default async function TemplateTopicPage({
  params,
}: {
  params: Promise<{ id: string; topicId: string }>
}) {
  const { id, topicId } = await params
  const t = await getTranslations("questions")
  const template = await serverFetch<PooledTemplate>(
    `/library/superadmin/templates/${id}`
  )
  const topic = template?.topics.find((item) => item.id === topicId)

  if (!template || !topic) {
    notFound()
  }

  const base = `/library/superadmin/templates/${id}`

  return (
    <main className="mx-auto max-w-page space-y-8 px-6 py-12">
      <PageHeader
        back={
          <BackLink
            href={`/superadmin/templates/${id}`}
            // On the title's line, not centered on the title and its subtopics.
            className="wide:inset-y-auto wide:-top-2.5 wide:my-0"
          >
            {template.title}
          </BackLink>
        }
        title={
          <div {...languageOf(template.language)} className="space-y-3">
            <h1 className="font-heading text-3xl font-medium tracking-tight normal-case">
              {topic.title}
            </h1>
            <SubtopicList subtopics={topic.subtopics} />
          </div>
        }
      />
      <WarningCard className="max-sm:-mx-6 max-sm:rounded-none">
        {t("aiWritten")}
      </WarningCard>
      <TopicQuestionList
        language={template.language}
        path={`${base}/topics/${topicId}/questions`}
        regeneratePath={`/generate/superadmin/templates/${id}/questions`}
        wrongPath={`${base}/questions`}
        reportsPath={`${base}/questions`}
      />
    </main>
  )
}
