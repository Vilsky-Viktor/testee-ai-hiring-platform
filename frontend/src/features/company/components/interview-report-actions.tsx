"use client"

import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { flushSync } from "react-dom"

import { InterviewReport } from "@/features/company/components/interview-report"
import { InterviewTopMenu } from "@/features/company/components/interview-top-menu"
import { ShareReport } from "@/features/company/components/share-report"
import { useReportActions } from "@/features/company/hooks/use-report-actions"
import { INTERVIEW_REPORT_ID } from "@/config/report"
import { useReportTranslate } from "@/hooks/use-report-translate"
import { apiFetch } from "@/lib/api"
import { candidatesSummary } from "@/lib/report-summary"
import type { InterviewReportData } from "@/types/company"

/** The report of all a test's candidates: download or share it, in the "⋮" menu of its candidates
 * tab, with the menu's other actions. Its data loads on the first click, not with the page. */
export function InterviewReportActions({
  interviewId,
  title,
  interviewsHref,
  canEdit,
}: {
  interviewId: string
  title: string
  interviewsHref: string
  canEdit: boolean
}) {
  const t = useTranslations("report")
  const locale = useLocale()
  const translate = useReportTranslate()
  const [report, setReport] = useState<InterviewReportData | null>(null)

  // Rendered at once, so the hidden report is on the page when the PDF is made from it.
  async function load() {
    if (report) {
      return
    }

    const loaded = await apiFetch<InterviewReportData>(
      `/companies/interviews/${interviewId}/report`
    )
    flushSync(() => setReport(loaded))
  }

  const { busy, sharing, setSharing, makePdf, download, share } =
    useReportActions({
      reportId: INTERVIEW_REPORT_ID,
      fileName: t("candidatesFileName", { title }),
      pages: true,
      load,
    })

  return (
    <>
      {report && <InterviewReport report={report} />}
      <InterviewTopMenu
        interviewId={interviewId}
        title={title}
        interviewsHref={interviewsHref}
        canEdit={canEdit}
        extra={[
          { label: t("download"), onClick: download, disabled: busy },
          { label: t("share"), onClick: share, disabled: busy },
        ]}
      />
      <ShareReport
        open={sharing}
        onOpenChange={setSharing}
        path={`/companies/interviews/${interviewId}/report/email`}
        summary={report ? candidatesSummary(report, translate, locale) : ""}
        makePdf={makePdf}
      />
    </>
  )
}
