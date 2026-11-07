"use client"

import { RotateCcwIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { ShortNumber } from "@/components/common/short-number"
import { Button } from "@/components/ui/button"
import { apiErrorMessage, apiFetch, serviceRefusal } from "@/lib/api"
import { formatPrice } from "@/lib/format"
import type { RefundResult } from "@/types/billing"
import type { RefundOffer } from "@/types/company"

/** Refunds a top-up's unspent credits, what billing offers for it, after a confirmation saying
 * what happens. `heldBack` is the candidates whose reserved credits it leaves out. */
export function RefundButton({
  companyId,
  transactionId,
  offer,
  heldBack,
}: {
  companyId: string
  transactionId: string
  offer: RefundOffer
  heldBack: number
}) {
  const t = useTranslations("companyBilling.refund")
  const locale = useLocale()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const amount = formatPrice(Number(offer.amount), offer.currency, locale)

  async function refund() {
    setBusy(true)

    try {
      const { status } = await apiFetch<RefundResult>(
        `/companies/companies/${companyId}/billing/refund`,
        {
          method: "POST",
          body: JSON.stringify({ transaction_id: transactionId }),
        }
      )
      toast.success(t(status === "refunded" ? "refunded" : "processing"))
    } catch (error) {
      toast.error(
        serviceRefusal(error, [409]) ?? apiErrorMessage(error, t("failed"))
      )
    } finally {
      // Refused too: the row shows what's true now.
      setBusy(false)
      setOpen(false)
      router.refresh()
    }
  }

  return (
    <>
      {/* An outline pill, like the invoice beside it. */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 px-4 text-sm has-data-[icon=inline-start]:ps-4"
        data-testid="refund-top-up"
        onClick={() => setOpen(true)}
      >
        <RotateCcwIcon data-icon="inline-start" />
        {t("open")}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={t("title", { amount })}
        text={
          <>
            <span className="block">
              {t.rich("text", {
                amount,
                count: offer.credits,
                credits: () => <ShortNumber value={offer.credits} />,
              })}
            </span>
            {offer.takes_referral && (
              <span className="block" data-testid="refund-referral">
                {t("referral")}
              </span>
            )}
            {offer.auto_top_up_on && (
              <span className="block" data-testid="refund-auto-top-up">
                {t("autoTopUp")}
              </span>
            )}
            {heldBack > 0 && (
              <span className="block" data-testid="refund-held-back">
                <HeldBack companyId={companyId} candidates={heldBack} />
              </span>
            )}
          </>
        }
        confirm={t("confirm", { amount })}
        busy={busy}
        onConfirm={refund}
      />
    </>
  )
}

/** Why some of a top-up can't be refunded yet, with where to revoke the invites holding it. */
export function HeldBack({
  companyId,
  candidates,
}: {
  companyId: string
  candidates: number
}) {
  const t = useTranslations("companyBilling.refund")

  return t.rich("heldBack", {
    count: candidates,
    reserved: (chunks) => (
      <Link
        href={`/companies/${companyId}/billing?tab=reserved`}
        className="font-medium text-foreground"
      >
        {chunks}
      </Link>
    ),
  })
}
