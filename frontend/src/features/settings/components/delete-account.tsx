"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { TEXT_LINK } from "@/config/links"
import { Dot } from "@/components/common/dot"
import { apiErrorMessage, apiFetch } from "@/lib/api"
import { signOut } from "@/lib/auth"
import type { AccountDeletion } from "@/types/company"

export function DeleteAccount({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations("deleteAccount")
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  // What happens to the companies the user owns; null until read, or when it couldn't be.
  const [owned, setOwned] = useState<AccountDeletion | null>(null)

  useEffect(() => {
    if (open) {
      apiFetch<AccountDeletion>("/companies/account/deletion")
        .then(setOwned)
        .catch(() => setOwned(null))
    }
  }, [open])

  const blocked = Boolean(owned?.blocked.length)

  async function remove() {
    setDeleting(true)

    try {
      await apiFetch("/accounts/me", { method: "DELETE" })
      await signOut()
      onOpenChange(false)
      toast.success(t("deleted"))
      router.push("/")
    } catch (error) {
      toast.error(apiErrorMessage(error, t("failed")))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t("title")}
      text={
        <>
          <span className="block">{t("everything")}</span>
          {owned === null && <span className="block">{t("company")}</span>}
        </>
      }
      confirm={t("confirm")}
      busy={deleting}
      onConfirm={remove}
      confirmDisabled={blocked}
    >
      {/* A company others joined blocks it: another member becomes its owner first. */}
      {blocked && (
        <div className="space-y-2 text-base">
          <p className="text-destructive">{t("blocked")}</p>
          <ul className="list-disc space-y-1 ps-5">
            {owned?.blocked.map((company) => (
              <li key={company.id}>
                <Link
                  href={`/companies/${company.id}/members`}
                  className={TEXT_LINK}
                  onClick={() => onOpenChange(false)}
                >
                  {company.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {Boolean(owned?.deleted.length) && (
        <div className="space-y-2 text-base text-muted-foreground">
          <p>{t("deletedWith")}</p>
          <ul className="list-disc space-y-1 ps-5">
            {owned?.deleted.map((company) => (
              <li key={company.id}>
                {company.name}
                {company.credits !== null && (
                  <>
                    <Dot />
                    {t("credits", { count: company.credits })}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </ConfirmDialog>
  )
}
