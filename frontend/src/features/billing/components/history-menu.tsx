"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { DotsMenu } from "@/components/common/dots-menu"
import { DownloadDialog } from "@/components/common/download-dialog"

/** The history's "⋮" menu: download it as a CSV file. */
export function HistoryMenu({ companyId }: { companyId: string }) {
  const t = useTranslations("companyBilling.download")
  const [open, setOpen] = useState(false)

  return (
    <>
      <DotsMenu items={[{ label: t("open"), onClick: () => setOpen(true) }]} />
      <DownloadDialog
        open={open}
        onOpenChange={setOpen}
        path={`/companies/companies/${companyId}/billing/history/export`}
        texts={{
          title: t("title"),
          description: t("description"),
          save: t("save"),
          failed: t("failed"),
        }}
      />
    </>
  )
}
