"use client"

import { useTranslations } from "next-intl"

import { PillChoice } from "@/components/common/pill-choice"
import { ShortNumber } from "@/components/common/short-number"
import { SummaryCards } from "@/components/common/summary-cards"
import type { QuestionStats } from "@/types/feedback"

export type QuestionFilter = "all" | "active" | "disabled" | "reported"

/** Whether a question is one `filter` shows. */
export function questionMatches(
  question: QuestionStats,
  filter: QuestionFilter
) {
  if (filter === "active") {
    return !question.excluded
  }

  if (filter === "disabled") {
    return Boolean(question.excluded)
  }

  return filter === "all" || question.reports > 0
}

/** An interview's topic at a glance, and the filter of its questions. */
export function QuestionOverview({
  questions,
  filter,
  onFilter,
}: {
  questions: QuestionStats[]
  filter: QuestionFilter
  onFilter: (filter: QuestionFilter) => void
}) {
  const t = useTranslations("questions")
  const disabled = questions.filter((item) => item.excluded).length
  const reports = questions.reduce((sum, item) => sum + item.reports, 0)

  return (
    <>
      <SummaryCards
        testId="question-summary"
        className="lg:grid-cols-4"
        rows={[
          {
            id: "total",
            label: t("summary.total"),
            value: <ShortNumber value={questions.length} />,
          },
          {
            id: "active",
            label: t("active"),
            value: <ShortNumber value={questions.length - disabled} />,
          },
          {
            id: "disabled",
            label: t("disabled"),
            value: <ShortNumber value={disabled} />,
          },
          {
            id: "reports",
            label: t("reports"),
            value: <ShortNumber value={reports} />,
          },
        ]}
      />
      <PillChoice
        testId="question-filter"
        value={filter}
        onChange={onFilter}
        options={[
          { value: "all", label: t("filters.all") },
          { value: "active", label: t("active") },
          { value: "disabled", label: t("disabled") },
          { value: "reported", label: t("filters.reported") },
        ]}
      />
    </>
  )
}
