import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { ReferralLink } from "@/features/billing/components/referral-link"
import { ReferralRewards } from "@/features/billing/components/referral-rewards"
import { CompanyHeader } from "@/features/company/components/company-header"
import { ShortNumber } from "@/components/common/short-number"
import { SummaryCards } from "@/components/common/summary-cards"
import { InfoCard } from "@/components/common/warning-card"
import { SignInPrompt } from "@/components/common/sign-in-prompt"
import { TOKEN_COOKIE } from "@/config/auth"
import { serverFetch } from "@/lib/server-api"
import { translatedTitle } from "@/lib/site"
import { companyHeaderProps } from "@/lib/company-header"
import type { Company, CompanyReferral } from "@/types/company"
import { CARD } from "@/config/cards"

export const generateMetadata = () => translatedTitle("company", "referrals")

export default async function ReferralsPage({
  params,
}: {
  params: Promise<{ companyId: string }>
}) {
  const { companyId } = await params
  const t = await getTranslations("referral")
  const signedIn = (await cookies()).has(TOKEN_COOKIE)
  // Asked together: the API refuses the referral on its own when the company isn't theirs.
  const [company, referral] = signedIn
    ? await Promise.all([
        serverFetch<Company>(`/companies/companies/${companyId}`),
        serverFetch<CompanyReferral>(
          `/companies/companies/${companyId}/referral`
        ),
      ])
    : [null, null]

  if (!signedIn) {
    return (
      <main className="mx-auto max-w-page px-6 py-12">
        <SignInPrompt />
      </main>
    )
  }

  if (!company) {
    redirect("/companies")
  }

  return (
    <main className="mx-auto max-w-page space-y-8 px-6 py-12">
      <CompanyHeader
        {...companyHeaderProps(company)}
        companyId={companyId}
        current="referrals"
      >
        {referral && (
          <>
            {/* What a referral earns, and the link to share; on phones the cards span the screen,
              with square corners. */}
            <div
              className={`${CARD} space-y-4 max-sm:-mx-6 max-sm:rounded-none`}
            >
              <div className="space-y-1">
                <h2 className="font-heading text-lg font-medium">
                  {t.rich("title", {
                    n: () => (
                      <span className="uppercase">
                        <ShortNumber value={referral.reward} />
                      </span>
                    ),
                  })}
                </h2>
                <p className="text-base text-muted-foreground">
                  {t("text", { count: referral.reward_candidates })}
                </p>
              </div>
              <ReferralLink referral={referral} path="/companies" />
            </div>
            <InfoCard className="max-sm:-mx-6 max-sm:rounded-none">
              <ol className="list-inside list-decimal space-y-1">
                <li>{t("steps.share")}</li>
                <li>{t("steps.create")}</li>
                <li>{t("steps.reward")}</li>
              </ol>
            </InfoCard>
            <SummaryCards
              testId="referral-summary"
              className="max-sm:*:last:col-span-2 lg:grid-cols-3"
              rows={[
                {
                  id: "referred",
                  label: t("summary.referred"),
                  value: <ShortNumber value={referral.rewarded} />,
                },
                {
                  id: "earned",
                  label: t("summary.earned"),
                  value: <ShortNumber value={referral.earned} />,
                },
                {
                  id: "left",
                  label: t("summary.left"),
                  value: t("summary.leftValue", {
                    left: referral.rewards_left,
                    total: referral.rewards_per_year,
                  }),
                },
              ]}
            />
            <ReferralRewards rewards={referral.rewards} />
          </>
        )}
      </CompanyHeader>
    </main>
  )
}
