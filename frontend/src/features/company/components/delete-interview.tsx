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

export function DeleteInterview({
  interviewId,
  title,
  leaveTo,
  onRemoved,
  opened,
  onOpenedChange,
}: {
  interviewId: string
  title: string
  // Opened from elsewhere (a row's menu): no button of its own.
  opened?: boolean
  onOpenedChange?: (open: boolean) => void
  // Where to go once deleted, from the interview's own page; a list just refreshes.
  leaveTo?: string
  // Takes it out of the list at once (pages loaded past the first aren't refreshed).
  onRemoved?: () => void
}) {
  const t = useTranslations("interviews")
  const common = useTranslations("common")
  const router = useRouter()
  const [own, setOwn] = useState(false)
  const open = opened ?? own
  const setOpen = onOpenedChange ?? setOwn
  const [deleting, setDeleting] = useState(false)

  async function remove() {
    setDeleting(true)

    try {
      await apiFetch(`/companies/interviews/${interviewId}`, {
        method: "DELETE",
      })
      setOpen(false)
      onRemoved?.()

      if (leaveTo) {
        router.push(leaveTo)
      }

      router.refresh()
    } catch (error) {
      toast.error(apiErrorMessage(error, t("deleteFailed")))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      {opened === undefined && (
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
      )}
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
