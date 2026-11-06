"use client"

import { cn } from "cn"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { BalanceTooltip } from "@/components/common/balance-tooltip"
import { RefreshOnFocus } from "@/components/common/refresh-on-focus"
import { useCountUp } from "@/hooks/use-count-up"
import { WARNING_TONE } from "@/config/tones"

/** The company's credits for candidates, with a top-up next to them, in the page header.
 * Without `canEdit` (a viewer) only the balance shows. */
export function CompanyCredits({
  companyId,
  credits,
  low,
  canEdit,
}: {
  companyId: string
  credits: number
  low: boolean
  canEdit: boolean
}) {
  const t = useTranslations("company")
  // A top-up arriving counts up, as in the header.
  const { shown, rising } = useCountUp(credits)

  const card = (
    <span className="text-base text-muted-foreground max-sm:text-lg">
      <BalanceTooltip
        className={cn(
          "font-medium text-foreground tabular-nums transition-colors duration-500",
          rising && "text-primary",
          low && WARNING_TONE
        )}
        note={low ? t("creditsLow") : undefined}
        shown={shown}
        balance={credits}
      />{" "}
      {t("creditsLeft", { count: credits })}
    </span>
  )

  // A small card in the page header: the balance (amber when it runs low); it leads to the
  // top-up page.
  // On phones it spans the page, centered, in larger type.
  return (
    <>
      {canEdit ? (
        <Link
          href={`/top-up?company=${companyId}`}
          data-testid="top-up"
          className="rounded-xl border px-4 py-2 text-end whitespace-nowrap transition-colors hover:bg-surface max-sm:text-center"
        >
          {card}
        </Link>
      ) : (
        <span className="rounded-xl border px-4 py-2 text-end whitespace-nowrap max-sm:text-center">
          {card}
        </span>
      )}
      <RefreshOnFocus />
    </>
  )
}
