"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { QuestionReports } from "@/components/common/question-reports"
import { ReportDialog } from "@/components/common/report-dialog"
import { Button } from "@/components/ui/button"
import type { QuestionStats } from "@/types/feedback"

/** A question's reports, under its row; with `feedbackPath`, a member adds their own on top (the
 * button then says they did, while they stay on the page: reports are anonymous). */
export function QuestionReportsPanel({
  question,
  reportsPath,
  feedbackPath,
  onChange,
}: {
  question: QuestionStats
  reportsPath: string
  feedbackPath?: string
  onChange: (question: QuestionStats) => void
}) {
  const t = useTranslations("questions")
  // A remount after a report shows it in the list.
  const [reportsKey, setReportsKey] = useState(0)
  const reported = Boolean(question.reported)

  return (
    <div
      data-testid="question-reports"
      className="col-span-full space-y-4 bg-surface py-5 ps-5 pe-6"
    >
      {feedbackPath && (
        <div className="flex justify-center">
          <ReportDialog
            basePath={`${feedbackPath}/${question.id}`}
            known={reported}
            onReported={() => {
              onChange({
                ...question,
                reported: true,
                reports: question.reports + 1,
              })
              setReportsKey((key) => key + 1)
            }}
            trigger={
              <Button
                variant="outline"
                disabled={reported}
                className="h-10 px-5 text-base"
              >
                {reported ? t("youReported") : t("addReport")}
              </Button>
            }
          />
        </div>
      )}
      <QuestionReports
        key={reportsKey}
        path={`${reportsPath}/${question.id}/reports`}
      />
    </div>
  )
}
