import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { BackLink } from "@/components/common/back-link"
import { PageHeader } from "@/components/common/page-header"
import { SignInPage } from "@/components/common/sign-in-page"
import { SubtopicList } from "@/components/common/subtopic-list"
import { TopicQuestionList } from "@/components/common/topic-question-list"
import { WarningCard } from "@/components/common/warning-card"
import { languageOf } from "@/lib/locale"
import { serverFetch, signedIn } from "@/lib/server-api"
import { translatedTitle } from "@/lib/site"
import type { InterviewDetail } from "@/types/company"

export const generateMetadata = () => translatedTitle("questions", "manage")

/** One topic of an interview, its questions on their own page: every member likes, dislikes or
 * reports them; owners and admins also leave some out, re-generate them or mark a wrong answer. */
export default async function TopicQuestionsPage({
  params,
}: {
  params: Promise<{ companyId: string; id: string; topicId: string }>
}) {
  if (!(await signedIn())) {
    return <SignInPage />
  }

  const { companyId, id, topicId } = await params
  const t = await getTranslations("questions")
  const interviews = await getTranslations("interviews")
  const interview = await serverFetch<InterviewDetail>(
    `/companies/interviews/${id}`
  )
  const topic = interview?.topics.find((item) => item.id === topicId)

  if (!interview || !topic) {
    notFound()
  }

  const canEdit = interview.can_edit
  const questionsPath = `/companies/interviews/${id}/questions`
  const topicPath = `/companies/interviews/${id}/topics/${topicId}/questions`

  return (
    <main className="mx-auto max-w-page space-y-8 px-6 py-12">
      <PageHeader
        back={
          <BackLink
            href={`/companies/${companyId}/interviews/${id}`}
            help="topicQuestions"
            // On the title's line, not centered on the title and its subtopics.
            className="wide:inset-y-auto wide:-top-1.5 wide:my-0"
          >
            {interviews("interview")}
          </BackLink>
        }
        title={
          <div className="space-y-3">
            <div {...languageOf(interview.language)} className="space-y-3">
              <h1 className="font-heading text-3xl font-medium tracking-tight normal-case">
                {topic.title}
              </h1>
              <SubtopicList subtopics={topic.subtopics} />
            </div>
            <p
              data-testid="topic-limit-line"
              className="text-sm text-muted-foreground"
            >
              {t("limitLine", {
                limit: topic.question_limit,
                count: topic.question_count,
              })}
            </p>
          </div>
        }
      />
      {/* Owners should know the keys can be wrong (the AI Act's instructions for use). */}
      <WarningCard className="max-sm:-mx-6 max-sm:rounded-none">
        {t("aiWritten")}
      </WarningCard>
      <TopicQuestionList
        language={interview.language}
        path={topicPath}
        regeneratePath={canEdit ? questionsPath : undefined}
        wrongPath={canEdit ? questionsPath : undefined}
        reportsPath={questionsPath}
        feedbackPath={questionsPath}
        excludePath={canEdit ? topicPath : undefined}
      />
    </main>
  )
}
