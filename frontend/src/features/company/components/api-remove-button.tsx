"use client"

import { Trash2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Button } from "@/components/ui/button"
import { apiErrorMessage, apiFetch } from "@/lib/api"

/** The bin icon, like removing a member, asking first; `path` is the /manage route to delete. */
export function RemoveButton({
  path,
  label,
  title,
  text,
  failed,
  opened,
  onOpenedChange,
}: {
  path: string
  label: string
  title: string
  text: React.ReactNode
  failed: string
  // Opened from elsewhere (a row's menu): no button of its own.
  opened?: boolean
  onOpenedChange?: (open: boolean) => void
}) {
  const common = useTranslations("common")
  const router = useRouter()
  const [own, setOwn] = useState(false)
  const confirming = opened ?? own
  const setConfirming = onOpenedChange ?? setOwn
  const [busy, setBusy] = useState(false)

  async function remove() {
    setBusy(true)

    try {
      await apiFetch(path, { method: "DELETE" })
      setConfirming(false)
      router.refresh()
    } catch (error) {
      toast.error(apiErrorMessage(error, failed))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      {opened === undefined && (
        <Button
          variant="ghost"
          size="icon"
          className="size-12 shrink-0 text-muted-foreground hover:text-destructive"
          aria-label={label}
          disabled={busy}
          onClick={() => setConfirming(true)}
        >
          <Trash2Icon className="size-6" />
        </Button>
      )}
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={title}
        text={text}
        confirm={common("delete")}
        busy={busy}
        onConfirm={remove}
      />
    </>
  )
}
