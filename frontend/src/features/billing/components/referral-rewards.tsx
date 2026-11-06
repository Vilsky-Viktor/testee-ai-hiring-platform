import { Building2Icon } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { LocalDate } from "@/components/common/local-date"
import { LIST_BOX, ROW_HOVER, ROW_ICON } from "@/config/lists"
import { CreditAmount } from "@/features/billing/components/credit-amount"
import type { CompanyReferral } from "@/types/company"

/** The companies that came through the link and topped up, each with the credits it gave then;
 * a line pointing to the link while there are none. */
export async function ReferralRewards({
  rewards,
}: {
  rewards: CompanyReferral["rewards"]
}) {
  const t = await getTranslations("referral")

  if (rewards.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">{t("empty")}</p>
    )
  }

  return (
    <ul
      className={`${LIST_BOX} overflow-hidden`}
      data-testid="referral-rewards"
    >
      {rewards.map((reward, index) => (
        <li
          key={index}
          className={`group/row flex items-center gap-4 p-6 ${ROW_HOVER}`}
        >
          <span aria-hidden className={ROW_ICON}>
            <Building2Icon className="size-5" />
          </span>
          <span className="min-w-0 flex-1 space-y-1">
            <span className="block truncate text-lg font-medium normal-case">
              {reward.name ?? t("deletedCompany")}
            </span>
            <span className="block text-sm text-muted-foreground">
              <LocalDate iso={reward.rewarded_at} />
            </span>
          </span>
          <CreditAmount amount={reward.credits} />
        </li>
      ))}
    </ul>
  )
}
