"use client"

import { DownloadIcon, Share2Icon } from "lucide-react"
import { useTranslations } from "next-intl"

import { IconButton } from "@/components/common/icon-button"
import { ShareReport } from "@/features/company/components/share-report"
import { useReportActions } from "@/features/company/hooks/use-report-actions"

/** Download a PDF report, or share it by email or chat (useReportActions); `emailPath` emails it,
 * `summary` is the chat message. Icons like the page's other actions; their tooltips name them. */
export function ReportActions({
  reportId,
  fileName,
  emailPath,
  summary,
  pages = false,
  load,
}: {
  reportId: string
  fileName: string
  emailPath: string
  summary: string
  pages?: boolean
  // Loads the report's data, and so the hidden report, the first time it's needed.
  load?: () => Promise<void>
}) {
  const t = useTranslations("report")
  const { busy, sharing, setSharing, makePdf, download, share } =
    useReportActions({ reportId, fileName, pages, load })

  return (
    <>
      <IconButton label={t("download")} disabled={busy} onClick={download}>
        <DownloadIcon className="size-6" />
      </IconButton>
      <IconButton label={t("share")} disabled={busy} onClick={share}>
        <Share2Icon className="size-6" />
      </IconButton>
      <ShareReport
        open={sharing}
        onOpenChange={setSharing}
        path={emailPath}
        summary={summary}
        makePdf={makePdf}
      />
    </>
  )
}
