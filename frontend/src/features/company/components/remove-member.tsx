"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { apiErrorMessage, apiFetch } from "@/lib/api"
import { bdi } from "@/lib/bidi"
import type { CompanyMember } from "@/types/company"

/** Removes a member, or withdraws an invite they haven't accepted yet, after a confirmation. */
export function RemoveMember({
  companyId,
  member,
  open,
  onOpenChange,
  onRemoved,
}: {
  companyId: string
  member: CompanyMember
  open: boolean
  onOpenChange: (open: boolean) => void
  onRemoved: () => void
}) {
  const t = useTranslations("members")
  const [busy, setBusy] = useState(false)
  const email = member.email

  async function remove() {
    setBusy(true)

    try {
      await apiFetch(
        `/companies/members/${member.id}?company_id=${companyId}`,
        { method: "DELETE" }
      )
      toast.success(t.rich("removed", { email, ...bdi }))
      onRemoved()
    } catch (error) {
      toast.error(apiErrorMessage(error, t("removeFailed")))
      setBusy(false)
      onOpenChange(false)
    }
  }

  return (
    <>
      <ConfirmDialog
        open={open}
        onOpenChange={onOpenChange}
        title={t("removeTitle")}
        text={t.rich(member.joined ? "removeText" : "removeInviteText", {
          email,
          ...bdi,
        })}
        confirm={t("removeConfirm")}
        busy={busy}
        onConfirm={remove}
      />
    </>
  )
}
