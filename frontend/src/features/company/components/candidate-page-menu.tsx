"use client"

import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"

import { CandidateMenu } from "@/features/company/components/candidate-menu"
import { ShareReport } from "@/features/company/components/share-report"
import { useReportActions } from "@/features/company/hooks/use-report-actions"
import { REPORT_ID } from "@/config/report"
import { useReportTranslate } from "@/hooks/use-report-translate"
import { reportSummary } from "@/lib/report-summary"
import type { CandidateReportData, Scorecard } from "@/types/company"

/** The "⋮" menu of a candidate's page: what their row's has, and with a `report`, downloading and
 * sharing it. Removing them goes back to `backHref`. */
export function CandidatePageMenu({
  interviewId,
  card,
  report,
  backHref,
}: {
  interviewId: string
  card: Scorecard
  report: CandidateReportData | null
  backHref: string
}) {
  const t = useTranslations("report")
  const locale = useLocale()
  const translate = useReportTranslate()
  const router = useRouter()
  const { busy, sharing, setSharing, makePdf, download, share } =
    useReportActions({
      reportId: REPORT_ID,
      fileName: t("fileName", { email: card.email }),
    })

  return (
    <>
      <CandidateMenu
        interviewId={interviewId}
        candidate={card}
        canEdit={card.can_edit}
        extra={
          report
            ? [
                { label: t("download"), onClick: download, disabled: busy },
                { label: t("share"), onClick: share, disabled: busy },
              ]
            : []
        }
        onRemoved={() => router.push(backHref)}
      />
      {report && (
        <ShareReport
          open={sharing}
          onOpenChange={setSharing}
          path={`/companies/interviews/${interviewId}/candidates/${card.id}/report/email`}
          summary={reportSummary(report, translate, locale)}
          makePdf={makePdf}
        />
      )}
    </>
  )
}
