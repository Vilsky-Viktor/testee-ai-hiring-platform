import Link from "next/link"
import { useTranslations } from "next-intl"

import { SubtopicList } from "@/components/common/subtopic-list"
import { TopicLimit, TopicsHeader } from "@/components/common/topic-limit"
import { TopicQuestionLimit } from "@/components/common/topic-question-limit"
import { LIST_BOX, ROW_HOVER } from "@/config/lists"
import { languageOf } from "@/lib/locale"
import type { InterviewDetail } from "@/types/company"

/** An interview's topics, each opening its questions, with how many each candidate gets and how
 * many were disabled, in the interview's `language`. Viewers read the questions; only owners and
 * admins (`canEdit`) change them. */
export function InterviewTopics({
  companyId,
  interviewId,
  language,
  topics,
  canEdit,
}: {
  companyId: string
  interviewId: string
  language: string
  topics: InterviewDetail["topics"]
  canEdit: boolean
}) {
  const t = useTranslations("questions")

  if (topics.length === 0) {
    return null
  }

  return (
    <ul className={`${LIST_BOX} overflow-hidden`}>
      {canEdit && <TopicsHeader className="px-6" />}
      {topics.map((topic) => (
        // The title's link fills the row; the number stays above it, and on phones takes the
        // line under the topic.
        <li
          key={topic.id}
          className={`group/topic relative flex items-center justify-between gap-6 p-6 ${ROW_HOVER} max-sm:flex-col max-sm:items-stretch`}
        >
          <span
            {...languageOf(language)}
            className="max-w-3xl min-w-0 space-y-3"
          >
            <Link
              href={`/companies/${companyId}/interviews/${interviewId}/topics/${topic.id}`}
              data-testid="manage-questions"
              className="block text-lg font-medium after:absolute after:inset-0"
            >
              {topic.title}
            </Link>
            <SubtopicList subtopics={topic.subtopics} />
            {topic.excluded_count > 0 && (
              <span
                data-testid="excluded-count"
                className="block text-sm text-muted-foreground"
              >
                {t("disabledCount", { count: topic.excluded_count })}
              </span>
            )}
          </span>
          <span className="relative z-10 shrink-0">
            {canEdit ? (
              // Remounts with the saved value after each change.
              <TopicLimit
                key={topic.question_limit}
                path={`/companies/interviews/${interviewId}/topics/${topic.id}/limit`}
                count={topic.question_count}
                limit={topic.question_limit}
              />
            ) : (
              <TopicQuestionLimit
                count={topic.question_count}
                limit={topic.question_limit}
              />
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}
