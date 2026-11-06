"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { DotsMenu } from "@/components/common/dots-menu"
import { DownloadDialog } from "@/components/common/download-dialog"
import { BiasAuditExport } from "@/features/company/components/bias-audit-export"
import type { Interview } from "@/types/company"

/** The action log's "⋮" menu: download the log, and the bias-audit export. */
export function ActionsMenu({
  companyId,
  interviews,
}: {
  companyId: string
  interviews: Interview[]
}) {
  const t = useTranslations("actionLog.download")
  const biasAudit = useTranslations("biasAudit")
  const [download, setDownload] = useState(false)
  const [audit, setAudit] = useState(false)

  return (
    <>
      <DotsMenu
        items={[
          { label: t("open"), onClick: () => setDownload(true) },
          { label: biasAudit("open"), onClick: () => setAudit(true) },
        ]}
      />
      <DownloadDialog
        open={download}
        onOpenChange={setDownload}
        path={`/companies/companies/${companyId}/actions/export`}
        texts={{
          title: t("title"),
          description: t("description"),
          save: t("save"),
          failed: t("failed"),
        }}
      />
      <BiasAuditExport
        open={audit}
        onOpenChange={setAudit}
        companyId={companyId}
        interviews={interviews}
      />
    </>
  )
}
