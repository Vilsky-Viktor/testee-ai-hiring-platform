"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { apiFetch } from "@/lib/api"
import { bdi } from "@/lib/bidi"
import type { CompanyCredits } from "@/types/billing"

export function RemoveCompany({
  companyId,
  name,
  open,
  onOpenChange,
  onRemoved,
}: {
  companyId: string
  name: string
  open: boolean
  onOpenChange: (open: boolean) => void
  // Takes it out of the list at once (pages loaded past the first aren't refreshed).
  onRemoved?: () => void
}) {
  const t = useTranslations("company")
  const router = useRouter()
  const [removing, setRemoving] = useState(false)
  // The company's credits, read when the dialog opens: they're lost with it.
  const [credits, setCredits] = useState<CompanyCredits | null>(null)

  useEffect(() => {
    if (open) {
      apiFetch<CompanyCredits>(`/companies/companies/${companyId}/credits`)
        .then(setCredits)
        .catch(() => setCredits(null))
    }
  }, [open, companyId])

  async function remove() {
    setRemoving(true)

    try {
      await apiFetch(`/companies/companies/${companyId}`, { method: "DELETE" })
      onOpenChange(false)
      onRemoved?.()
      router.refresh()
    } catch {
      toast.error(t("removeFailed"))
    } finally {
      setRemoving(false)
    }
  }

  return (
    <>
      <ConfirmDialog
        open={open}
        onOpenChange={onOpenChange}
        title={t.rich("removeTitle", { name, ...bdi })}
        text={t("removeText")}
        confirm={t("remove")}
        busy={removing}
        onConfirm={remove}
      >
        {credits && credits.available > 0 && (
          <p
            className="text-base text-destructive"
            data-testid="remove-credits"
          >
            {t("removeCredits", {
              credits: credits.available,
              candidates: credits.candidates,
            })}
          </p>
        )}
      </ConfirmDialog>
    </>
  )
}
