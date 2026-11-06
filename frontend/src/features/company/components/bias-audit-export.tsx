"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { DownloadDialog } from "@/components/common/download-dialog"
import { InterviewPicker } from "@/features/company/components/interview-picker"
import type { Interview } from "@/types/company"

// "All interviews" in the picker.
const ALL = "all"

/** The owner's export for an independent bias audit: the company's or one interview's finished
 * candidates, of a period, as a CSV file the API makes. */
export function BiasAuditExport({
  open,
  onOpenChange,
  companyId,
  interviews,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: string
  interviews: Interview[]
}) {
  const t = useTranslations("biasAudit")
  const [interview, setInterview] = useState(ALL)

  return (
    <DownloadDialog
      open={open}
      onOpenChange={onOpenChange}
      path={`/companies/companies/${companyId}/bias-audit`}
      params={interview === ALL ? {} : { interview_id: interview }}
      texts={{
        title: t("title"),
        description: t("description"),
        save: t("download"),
        failed: t("failed"),
      }}
      note={<p className="text-sm text-muted-foreground">{t("privacy")}</p>}
    >
      <InterviewPicker
        companyId={companyId}
        interviews={interviews}
        first={{ value: ALL, label: t("allInterviews") }}
        label={t("interview")}
        value={interview}
        onChange={setInterview}
      />
    </DownloadDialog>
  )
}
