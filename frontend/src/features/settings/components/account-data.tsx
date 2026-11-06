"use client"

import { DownloadIcon, Trash2Icon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { DeleteAccount } from "@/features/settings/components/delete-account"
import { Button } from "@/components/ui/button"
import { downloadMyData } from "@/lib/account"
import { apiErrorMessage } from "@/lib/api"

/** Downloads everything testee holds about the user. */
export function DownloadData() {
  const t = useTranslations("settings")
  const [downloading, setDownloading] = useState(false)

  async function download() {
    setDownloading(true)

    try {
      await downloadMyData()
    } catch (error) {
      toast.error(apiErrorMessage(error, t("downloadFailed")))
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="h-10 w-full px-5"
      disabled={downloading}
      onClick={download}
    >
      <DownloadIcon />
      {t("download")}
    </Button>
  )
}

/** Opens the confirmation that deletes the account. */
export function DeleteAccountButton() {
  const t = useTranslations("settings")
  const [deleting, setDeleting] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        className="h-10 w-full px-5 text-destructive hover:text-destructive"
        data-testid="delete-account"
        onClick={() => setDeleting(true)}
      >
        <Trash2Icon />
        {t("delete")}
      </Button>
      <DeleteAccount open={deleting} onOpenChange={setDeleting} />
    </>
  )
}
