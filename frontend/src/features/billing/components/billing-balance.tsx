import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { ShortNumber } from "@/components/common/short-number"
import { SummaryCards } from "@/components/common/summary-cards"
import { Button } from "@/components/ui/button"
import { WarningCard } from "@/components/common/warning-card"
import type { CompanyCredits } from "@/types/billing"

/** The balance at a glance, and a warning with Top up when it runs low. */
export async function Balance({
  credits,
  spent,
  companyId,
}: {
  credits: CompanyCredits
  spent: { credits: number } | null
  companyId: string
}) {
  const t = await getTranslations("companyBilling")
  const billing = await getTranslations("billing")

  return (
    <>
      <SummaryCards
        testId="billing-summary"
        className="lg:grid-cols-4"
        rows={[
          {
            id: "available",
            label: t("summary.available"),
            value: <ShortNumber value={credits.available} />,
          },
          {
            id: "candidates",
            label: t("summary.candidates"),
            value: <ShortNumber value={credits.candidates} />,
          },
          {
            id: "reserved",
            label: t("summary.reserved"),
            value: <ShortNumber value={credits.reserved} />,
          },
          {
            id: "spent",
            label: t("summary.spent"),
            value: spent ? <ShortNumber value={spent.credits} /> : "–",
          },
        ]}
      />
      {credits.low && (
        <WarningCard
          className="max-sm:-mx-6 max-sm:flex-wrap max-sm:rounded-none"
          action={<TopUpLink companyId={companyId} label={billing("topUp")} />}
        >
          {t("lowText")}
        </WarningCard>
      )}
    </>
  )
}

export function TopUpLink({
  companyId,
  label,
}: {
  companyId: string
  label: string
}) {
  return (
    <Button
      className="h-10 px-5 text-base"
      data-testid="top-up"
      render={<Link href={`/top-up?company=${companyId}`} />}
      nativeButton={false}
    >
      {label}
    </Button>
  )
}
