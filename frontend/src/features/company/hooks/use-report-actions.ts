import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { reportPdf } from "@/lib/report-pdf"

/** Downloading a PDF report and opening its share dialog. It's made from the hidden element
 * `reportId` (over several pages with `pages`), which `load`, when given, renders first. */
export function useReportActions({
  reportId,
  fileName,
  pages = false,
  load,
}: {
  reportId: string
  fileName: string
  pages?: boolean
  load?: () => Promise<void>
}) {
  const t = useTranslations("report")
  const [busy, setBusy] = useState(false)
  const [sharing, setSharing] = useState(false)

  // Made from the hidden report on the page.
  async function makePdf() {
    const node = document.getElementById(reportId)

    return node ? reportPdf(node, `${fileName}.pdf`, pages) : null
  }

  async function download() {
    setBusy(true)

    try {
      await load?.()
      const file = await makePdf()

      if (file) {
        const url = URL.createObjectURL(file)
        const link = document.createElement("a")
        link.href = url
        link.download = file.name
        link.click()
        // Released once the browser has started saving it.
        setTimeout(() => URL.revokeObjectURL(url), 1000)
      }
    } catch {
      toast.error(t("failed"))
    } finally {
      setBusy(false)
    }
  }

  async function share() {
    setBusy(true)

    try {
      await load?.()
      setSharing(true)
    } catch {
      toast.error(t("failed"))
    } finally {
      setBusy(false)
    }
  }

  return { busy, sharing, setSharing, makePdf, download, share }
}
