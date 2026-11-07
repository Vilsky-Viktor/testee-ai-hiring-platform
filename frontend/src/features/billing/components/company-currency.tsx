"use client"

import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { CurrencySelect } from "@/components/common/currency-select"
import { BILLING_REFRESHED } from "@/config/billing"
import { useSavedMark } from "@/hooks/use-saved-mark"
import { apiErrorMessage, apiFetch } from "@/lib/api"
import { formatPrice } from "@/lib/format"
import type { AutoTopUpCurrencyChange, CompanyCurrency } from "@/types/billing"

/** The currency the company's top-ups are priced and paid in, wherever the buyer is, as a pill at
 * the top of the top-up page: owners and admins change it (saved at once), others see the code.
 * The page's prices and the automatic top-up follow it; when billing says that changes a running
 * automatic top-up's amount, both amounts are confirmed first. Read by the page's server
 * (`initial`), so it's there as the page shows and nothing beside it moves. */
export function CompanyCurrencySetting({
  companyId,
  canEdit,
  initial,
}: {
  companyId: string
  canEdit: boolean
  initial: CompanyCurrency
}) {
  const t = useTranslations("companyBilling")
  const autoTopUp = useTranslations("autoTopUp")
  const locale = useLocale()
  const router = useRouter()
  const path = `/companies/companies/${companyId}/billing/currency`
  const [setting, setSetting] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [change, setChange] = useState<AutoTopUpCurrencyChange | null>(null)
  const { markSaved, savedText } = useSavedMark()

  async function whileSaving(step: () => Promise<void>) {
    setSaving(true)

    try {
      await step()
    } catch (error) {
      toast.error(apiErrorMessage(error, t("currencyFailed")))
    } finally {
      setSaving(false)
    }
  }

  async function save(currency: string) {
    const chosen = await apiFetch<CompanyCurrency>(path, {
      method: "PUT",
      body: JSON.stringify({ currency }),
    })
    setSetting(chosen)
    markSaved()
    // The page's prices come from its server.
    router.refresh()
    // What reads its own billing data (the automatic top-up) reads it again, in the new
    // currency.
    window.dispatchEvent(new Event(BILLING_REFRESHED))

    // A running automatic top-up charges in it at once, at the price billing says.
    if (chosen.auto_top_up_price != null) {
      toast.success(
        autoTopUp("currencyApplied", {
          amount: formatPrice(
            chosen.auto_top_up_price,
            chosen.currency,
            locale
          ),
        })
      )
    }
  }

  // A running automatic top-up's new amount is confirmed first; otherwise it's saved at once.
  function choose(currency: string) {
    return whileSaving(async () => {
      const coming = await apiFetch<AutoTopUpCurrencyChange | null>(
        `${path}/change?currency=${currency}`
      )

      if (coming) {
        setChange(coming)

        return
      }

      await save(currency)
    })
  }

  async function confirm(currency: string) {
    await whileSaving(() => save(currency))
    setChange(null)
  }

  return (
    <div data-testid="company-currency" data-currency={setting.currency}>
      {canEdit ? (
        <CurrencySelect
          label={t("currency")}
          value={setting.currency}
          currencies={setting.currencies}
          onChange={choose}
          disabled={saving}
          saved={savedText()}
          triggerClassName="h-12 w-auto max-w-none gap-2 px-6"
          short
        />
      ) : (
        <span className="text-sm text-muted-foreground">
          {setting.currency}
        </span>
      )}
      {change && (
        <ConfirmDialog
          open
          onOpenChange={() => setChange(null)}
          title={autoTopUp("currencyChange.title")}
          text={autoTopUp("currencyChange.text", {
            amount: formatPrice(change.price, change.currency, locale),
            newAmount: formatPrice(
              change.new_price,
              change.new_currency,
              locale
            ),
          })}
          confirm={autoTopUp("currencyChange.confirm")}
          busy={saving}
          onConfirm={() => confirm(change.new_currency)}
        />
      )}
    </div>
  )
}
