"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { LoadingSpinner } from "@/components/common/loading-spinner"
import {
  type QuestionFilter,
  questionMatches,
  QuestionOverview,
} from "@/components/common/question-overview"
import { QuestionRow } from "@/components/common/question-row"
import { VirtualList } from "@/components/common/virtual-list"
import { LIST_BOX } from "@/config/lists"
import { apiFetch, serviceRefusal } from "@/lib/api"
import type { QuestionStats } from "@/types/feedback"

/** A topic's questions, written in `language`, each with its feedback and what the reader may do
 * to it, led by an interview's overview and filter. */
export function TopicQuestionList({
  language,
  path,
  regeneratePath,
  wrongPath,
  reportsPath,
  feedbackPath,
  excludePath,
}: {
  language: string
  path: string
  regeneratePath?: string
  wrongPath?: string
  reportsPath?: string
  feedbackPath?: string
  excludePath?: string
}) {
  const t = useTranslations("questions")
  const common = useTranslations("common")
  const [questions, setQuestions] = useState<QuestionStats[] | null>(null)
  const [missing, setMissing] = useState(false)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<QuestionFilter>("all")

  useEffect(() => {
    let cancelled = false

    apiFetch<QuestionStats[]>(path)
      .then((rows) => {
        if (!cancelled) {
          setQuestions(rows)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMissing(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [path])

  function replace(next: QuestionStats) {
    setQuestions((rows) =>
      (rows ?? []).map((row) => (row.id === next.id ? next : row))
    )
  }

  async function regenerate(questionId: string) {
    setRegeneratingId(questionId)

    try {
      const fresh = await apiFetch<{ id: string; text: string }>(
        `${regeneratePath}/${questionId}/regenerate`,
        { method: "POST" }
      )
      setQuestions((rows) =>
        (rows ?? []).map((row) =>
          row.id === questionId
            ? {
                ...row,
                text: fresh.text,
                likes: 0,
                dislikes: 0,
                reports: 0,
                my_rating: null,
                reported: false,
              }
            : row
        )
      )
      toast.success(t("regenerated"))
    } catch (error) {
      toast.error(
        // A daily limit or the emergency pause explains itself; anything else is generic.
        serviceRefusal(error, [429, 503]) ?? t("regenerateFailed")
      )
    } finally {
      setRegeneratingId(null)
    }
  }

  if (missing) {
    return <p className="text-muted-foreground">{t("loadFailed")}</p>
  }

  if (!questions) {
    return <LoadingSpinner label={common("loading")} compact />
  }

  // Only an interview's questions can be left out, so only theirs are worth narrowing.
  const managed = questions.some((row) => row.excluded !== undefined)
  const numbers = new Map(questions.map((row, index) => [row.id, index + 1]))
  const shown = questions.filter((row) => questionMatches(row, filter))

  return (
    <div className="space-y-4">
      {managed && (
        <QuestionOverview
          questions={questions}
          filter={filter}
          onFilter={setFilter}
        />
      )}
      {shown.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          {t("noMatches")}
        </p>
      ) : (
        <VirtualList
          items={shown}
          getKey={(question) => question.id}
          // A question with its four answer options.
          estimateSize={200}
          className={`${LIST_BOX} overflow-hidden`}
          renderItem={(question) => (
            <QuestionRow
              question={question}
              number={numbers.get(question.id) ?? 0}
              language={language}
              canRegenerate={Boolean(regeneratePath)}
              wrongPath={wrongPath}
              reportsPath={reportsPath}
              feedbackPath={feedbackPath}
              excludePath={excludePath}
              regenerating={regeneratingId === question.id}
              busy={regeneratingId !== null}
              onRegenerate={() => regenerate(question.id)}
              onChange={replace}
            />
          )}
        />
      )}
    </div>
  )
}
