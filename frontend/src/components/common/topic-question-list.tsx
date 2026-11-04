"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { LoadingSpinner } from "@/components/common/loading-spinner"
import { QuestionRow } from "@/components/common/question-row"
import { VirtualList } from "@/components/common/virtual-list"
import { apiFetch, serviceRefusal } from "@/lib/api"
import type { QuestionStats } from "@/types/feedback"

/** A topic's questions, written in `language`, each with its feedback and what the reader may do
 * to it; in its own scroll box with `scrollClassName` (a dialog), else scrolling with the page. */
export function TopicQuestionList({
  language,
  path,
  regeneratePath,
  wrongPath,
  reportsPath,
  feedbackPath,
  excludePath,
  scrollClassName,
}: {
  language: string
  path: string
  regeneratePath?: string
  wrongPath?: string
  reportsPath?: string
  feedbackPath?: string
  excludePath?: string
  scrollClassName?: string
}) {
  const t = useTranslations("questions")
  const common = useTranslations("common")
  const [questions, setQuestions] = useState<QuestionStats[] | null>(null)
  const [missing, setMissing] = useState(false)
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null)

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

  return (
    <VirtualList
      items={questions}
      getKey={(question) => question.id}
      // A question with its four answer options.
      estimateSize={200}
      scrollClassName={scrollClassName}
      className="divide-y"
      renderItem={(question) => (
        <QuestionRow
          question={question}
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
  )
}
