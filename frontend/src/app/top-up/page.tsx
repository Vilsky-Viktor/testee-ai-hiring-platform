import { cn } from "cn"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { AutoTopUpSetting } from "@/components/common/auto-top-up"
import { BackLink } from "@/components/common/back-link"
import { BalanceTooltip } from "@/components/common/balance-tooltip"
import {
  CompanyChoice,
  COMPANY_CHOICE_ROW,
  FULL_LOGO,
  FULL_LOGO_ROW,
} from "@/components/common/company-choice"
import { PageHeader } from "@/components/common/page-header"
import { RefreshOnFocus } from "@/components/common/refresh-on-focus"
import { SignInPage } from "@/components/common/sign-in-page"
import { InfoCard } from "@/components/common/warning-card"
import { Button } from "@/components/ui/button"
import { CARD } from "@/config/cards"
import { LIST_BOX } from "@/config/lists"
import { WARNING_TONE } from "@/config/tones"
import { CustomTopUp } from "@/features/billing/components/custom-top-up"
import { CompanyCurrencySetting } from "@/features/billing/components/company-currency"
import { TopUpBalance } from "@/features/billing/components/top-up-balance"
import { companyCurrencyPath } from "@/lib/catalog"
import { optionalFetch, serverFetch, signedIn } from "@/lib/server-api"
import { translatedTitle } from "@/lib/site"
import type { Catalog, CompanyCredits, CompanyCurrency } from "@/types/billing"
import type { CompanyBalance } from "@/types/company"

export const generateMetadata = () => translatedTitle("topUp", "title")

/** Buying credits, on one narrow column: a sole company's form at once; with several, the list
 * of them first, each row opening its form (`?company=`). */
export default async function TopUpPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>
}) {
  if (!(await signedIn())) {
    return <SignInPage />
  }

  const t = await getTranslations("topUp")
  const common = await getTranslations("common")
  const { company } = await searchParams
  const companies =
    (await serverFetch<CompanyBalance[]>(
      "/companies/companies/credits?limit=100"
    )) ?? []
  const chosen =
    companies.length === 1
      ? companies[0]
      : companies.find((item) => item.id === company)
  const several = companies.length > 1
  const currency = chosen
    ? await optionalFetch<CompanyCurrency>(await companyCurrencyPath(chosen.id))
    : null

  return (
    <main className="mx-auto max-w-page px-6 py-12">
      <RefreshOnFocus />
      <div className="mx-auto max-w-3xl space-y-8">
        <PageHeader
          back={
            chosen && several ? (
              <BackLink href="/top-up" help="topUp">
                {t("allCompanies")}
              </BackLink>
            ) : (
              <BackLink href="/" help="topUp">
                {common("home")}
              </BackLink>
            )
          }
          title={
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="font-heading text-4xl font-medium tracking-tight">
                {t("title")}
              </h1>
              <div className="flex items-center gap-3">
                {chosen && currency && (
                  <CompanyCurrencySetting
                    companyId={chosen.id}
                    canEdit
                    initial={currency}
                  />
                )}
                <Button
                  variant="outline"
                  className="h-12 px-6 text-base"
                  render={<Link href="/pricing" />}
                  nativeButton={false}
                >
                  {t("pricing")}
                </Button>
              </div>
            </div>
          }
        />
        {chosen ? (
          <TopUpForm company={chosen} />
        ) : several ? (
          <CompanyList companies={companies} />
        ) : (
          <NoCompany />
        )}
      </div>
    </main>
  )
}

/** The companies to top up, each with its logo, name and credits. */
async function CompanyList({ companies }: { companies: CompanyBalance[] }) {
  const billing = await getTranslations("billing")

  return (
    <div className={`${LIST_BOX} overflow-hidden`}>
      {companies.map(({ id, name, logo_url, available, low }) => (
        <Link
          key={id}
          href={`/top-up?company=${id}`}
          className={cn(COMPANY_CHOICE_ROW, FULL_LOGO_ROW)}
        >
          <CompanyChoice
            name={name}
            logo={logo_url}
            logoClassName={FULL_LOGO}
            aside={
              <span
                className={cn(
                  "shrink-0 text-sm",
                  low ? WARNING_TONE : "text-muted-foreground"
                )}
              >
                <span className="font-heading text-3xl font-medium tabular-nums">
                  <BalanceTooltip shown={available} balance={available} />
                </span>{" "}
                {billing("creditsWord", { count: available })}
              </span>
            }
          />
        </Link>
      ))}
    </div>
  )
}

/** No company to top up yet: credits belong to one. */
async function NoCompany() {
  const t = await getTranslations("topUp")

  return (
    <div className={`flex flex-col items-start gap-4 ${CARD}`}>
      <p className="text-base text-muted-foreground">{t("noCompany")}</p>
      <Button
        className="h-12 px-6 text-base"
        render={<Link href="/companies" />}
        nativeButton={false}
      >
        {t("createCompany")}
      </Button>
    </div>
  )
}

/** What's left, how much to buy, and the automatic top-up. */
async function TopUpForm({ company }: { company: CompanyBalance }) {
  const pricing = await getTranslations("pricing")
  const billing = await getTranslations("billing")
  const path = `/companies/companies/${company.id}`
  const [catalog, credits] = await Promise.all([
    optionalFetch<Catalog>(`${path}/billing/catalog`),
    optionalFetch<CompanyCredits>(`${path}/credits`),
  ])

  if (!catalog || !credits) {
    return <InfoCard>{pricing("unavailable")}</InfoCard>
  }

  return (
    <div className="space-y-8">
      <TopUpBalance
        name={company.name}
        logo={company.logo_url}
        credits={credits}
      />
      <CustomTopUp catalog={catalog} companyId={company.id} />
      <p className="text-center text-sm text-muted-foreground">
        {billing("taxes")}
      </p>
      <AutoTopUpSetting catalog={catalog} companyId={company.id} card />
    </div>
  )
}
