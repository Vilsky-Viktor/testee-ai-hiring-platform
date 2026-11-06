"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"

import { BalanceTooltip } from "@/components/common/balance-tooltip"
import { CompanyChoice } from "@/components/common/company-choice"
import { WARNING_TONE } from "@/config/tones"
import { useCountUp } from "@/hooks/use-count-up"
import type { CompanyCredits } from "@/types/billing"

/** Whose credits are being topped up, and how many are left, large, with how many candidates
 * they pay for (or that they run low). */
export function TopUpBalance({
  name,
  logo,
  credits,
}: {
  name: string
  logo: string | null | undefined
  credits: CompanyCredits
}) {
  const t = useTranslations("billing")
  // A top-up arriving counts up, as in the header.
  const { shown, rising } = useCountUp(credits.available)

  return (
    <div className="-mx-6 flex items-center gap-4 overflow-hidden bg-surface pe-6 sm:mx-0 sm:rounded-xl">
      <CompanyChoice
        name={name}
        logo={logo}
        // The row's whole height, from its start edge.
        logoClassName="size-24 rounded-none bg-input"
        aside={
          <span className="shrink-0 text-end">
            <span className="block">
              <BalanceTooltip
                className={cn(
                  "font-heading text-3xl font-medium tabular-nums transition-colors duration-500",
                  rising && "text-primary"
                )}
                shown={shown}
                balance={credits.available}
              />{" "}
              <span className="text-sm text-muted-foreground">
                {t("creditsWord", { count: credits.available })}
              </span>
            </span>
            <span
              className={cn(
                "block text-sm text-muted-foreground",
                credits.low && WARNING_TONE
              )}
            >
              {credits.low
                ? t("low")
                : t("enough", { count: credits.candidates })}
            </span>
          </span>
        }
      />
    </div>
  )
}
