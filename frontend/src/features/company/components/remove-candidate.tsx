"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { apiErrorMessage, apiFetch } from "@/lib/api"
import { bdi } from "@/lib/bidi"

/** Asks before revoking an invite not used yet (`revokable`), or erasing a candidate who started,
 * for example when they ask to have their data erased. */
export function RemoveCandidate({
  interviewId,
  inviteId,
  email,
  revokable,
  open,
  onOpenChange,
  onRemoved,
}: {
  interviewId: string
  inviteId: string
  email: string
  revokable: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onRemoved: () => void
}) {
  const t = useTranslations("candidates")
  const [busy, setBusy] = useState(false)

  async function remove() {
    setBusy(true)

    try {
      await apiFetch(
        `/companies/interviews/${interviewId}/candidates/${inviteId}`,
        {
          method: "DELETE",
        }
      )
      toast.success(t.rich(revokable ? "revoked" : "erased", { email, ...bdi }))
      onOpenChange(false)
      onRemoved()
    } catch (error) {
      toast.error(
        apiErrorMessage(error, t(revokable ? "revokeFailed" : "eraseFailed"))
      )
      onOpenChange(false)
    } finally {
      setBusy(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t(revokable ? "revokeTitle" : "eraseTitle")}
      text={t.rich(revokable ? "revokeText" : "eraseText", { email, ...bdi })}
      confirm={t(revokable ? "revokeConfirm" : "eraseConfirm")}
      busy={busy}
      onConfirm={remove}
    />
  )
}
