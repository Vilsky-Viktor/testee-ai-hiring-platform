"use client"

import { Trash2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Button } from "@/components/ui/button"
import { apiErrorMessage, apiFetch } from "@/lib/api"
import { bdiText } from "@/lib/bidi"

export function DeleteTemplate({
  templateId,
  title,
}: {
  templateId: string
  title: string
}) {
  const t = useTranslations("superadmin")
  const common = useTranslations("common")
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function remove() {
    setDeleting(true)

    try {
      await apiFetch(`/library/superadmin/templates/${templateId}`, {
        method: "DELETE",
      })
      router.push("/superadmin/templates")
      router.refresh()
    } catch (error) {
      toast.error(apiErrorMessage(error, t("deleteFailed")))
      setDeleting(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="size-12 shrink-0 text-muted-foreground hover:text-destructive"
        aria-label={t.markup("deleteLabel", { title, ...bdiText })}
        tooltip={common("delete")}
        onClick={() => setOpen(true)}
      >
        <Trash2Icon className="size-6" />
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t("deleteTitle")}
        text={t("deleteText")}
        confirm={common("delete")}
        busy={deleting}
        onConfirm={remove}
      />
    </>
  )
}
