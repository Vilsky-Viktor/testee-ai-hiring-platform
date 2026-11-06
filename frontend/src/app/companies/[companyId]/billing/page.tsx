import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { FilterPills } from "@/components/common/filter-pills"
import {
  Balance,
  TopUpLink,
} from "@/features/billing/components/billing-balance"
import { HistoryMenu } from "@/features/billing/components/history-menu"
import { CreditHistory } from "@/features/billing/components/credit-history"
import { RefreshOnFocus } from "@/components/common/refresh-on-focus"
import { ReservedList } from "@/features/billing/components/reserved-list"
import { CompanyHeader } from "@/features/company/components/company-header"
import { SignInPrompt } from "@/components/common/sign-in-prompt"
import { InfoCard } from "@/components/common/warning-card"
import { TOKEN_COOKIE } from "@/config/auth"
import { PAGE_SIZE } from "@/config/lists"
import { optionalFetch, serverFetch } from "@/lib/server-api"
import { translatedTitle } from "@/lib/site"
import { companyHeaderProps } from "@/lib/company-header"
import type { CompanyCredits } from "@/types/billing"
import type {
  Company,
  CreditCandidate,
  CreditHistoryEntry,
} from "@/types/company"

// The kinds of movement the history can be narrowed to.
const HISTORY_KINDS = ["topups", "charges", "refunds"] as const

// What anyone but an owner or admin gets.
const EMPTY_DATA = {
  credits: null,
  reserved: null,
  history: null,
  spent: null,
}

export const generateMetadata = () => translatedTitle("company", "billing")

/** The balance, and the open sub-page's first page of rows. */
async function billingData(
  companyId: string,
  tab: "history" | "reserved",
  kind?: string
) {
  const api = `/companies/companies/${companyId}/billing`
  const [credits, reserved, history, spent] = await Promise.all([
    serverFetch<CompanyCredits>(`/companies/companies/${companyId}/credits`),
    tab === "reserved"
      ? serverFetch<CreditCandidate[]>(`${api}/reserved?limit=${PAGE_SIZE}`)
      : null,
    tab === "history"
      ? serverFetch<CreditHistoryEntry[]>(
          `${api}/history?limit=${PAGE_SIZE}${kind ? `&kind=${kind}` : ""}`
        )
      : null,
    optionalFetch<{ credits: number }>(`${api}/spent`),
  ])

  return { credits, reserved, history, spent }
}

export default async function BillingPage({
  params,
  searchParams,
}: {
  params: Promise<{ companyId: string }>
  searchParams: Promise<{ tab?: string; kind?: string }>
}) {
  const { companyId } = await params
  // History opens first; the reserved candidates have their own tab, so a long list of them
  // never pushes the history out of sight.
  const query = await searchParams
  const tab = query.tab === "reserved" ? "reserved" : "history"
  const kind = HISTORY_KINDS.find((item) => item === query.kind)
  const t = await getTranslations("companyBilling")
  const topUp = await getTranslations("billing")
  const signedIn = (await cookies()).has(TOKEN_COOKIE)
  const company = signedIn
    ? await serverFetch<Company>(`/companies/companies/${companyId}`)
    : null
  const href = `/companies/${companyId}/billing`
  const { credits, reserved, history, spent } = company?.can_edit
    ? await billingData(companyId, tab, kind)
    : EMPTY_DATA

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

  // Viewers don't see the company's billing.
  if (!company.can_edit) {
    redirect(`/companies/${companyId}/interviews`)
  }

  return (
    <main className="mx-auto max-w-page space-y-12 px-6 py-12">
      <RefreshOnFocus />
      <CompanyHeader
        {...companyHeaderProps(company)}
        companyId={companyId}
        current="billing"
        // The history and the reserved candidates, each a page of billing's in the menu.
        sub={[
          { id: "history", href, label: t("history") },
          {
            id: "reserved",
            href: `${href}?tab=reserved`,
            label: t("reservedTab"),
            count: credits?.reserved_candidates ?? 0,
          },
        ]}
        currentSub={tab}
        className="space-y-8"
        action={
          // On a phone, Top up takes the line and the dots stay beside it.
          <div className="flex items-center gap-3 max-sm:[&>a]:flex-1">
            <TopUpLink companyId={companyId} label={topUp("topUp")} />
            {tab === "history" && <HistoryMenu companyId={companyId} />}
          </div>
        }
      >
        {credits && (
          <Balance credits={credits} spent={spent} companyId={companyId} />
        )}
        {tab === "reserved" ? (
          <ReservedTab companyId={companyId} reserved={reserved} />
        ) : (
          <HistoryTab
            companyId={companyId}
            href={href}
            kind={kind}
            history={history}
          />
        )}
      </CompanyHeader>
    </main>
  )
}

/** The history, narrowed to one `kind` of movement or not. */
async function HistoryTab({
  companyId,
  href,
  kind,
  history,
}: {
  companyId: string
  href: string
  kind?: (typeof HISTORY_KINDS)[number]
  history: CreditHistoryEntry[] | null
}) {
  const t = await getTranslations("companyBilling")

  return (
    <div className="space-y-4">
      <FilterPills
        testId="history-filter"
        items={[undefined, ...HISTORY_KINDS].map((item) => ({
          id: item ?? "all",
          label: t(`kinds.${item ?? "all"}`),
          href: item ? `${href}?kind=${item}` : href,
          chosen: item === kind,
        }))}
      />
      <CreditHistory
        key={kind ?? "all"}
        companyId={companyId}
        initial={history ?? []}
        kind={kind}
      />
    </div>
  )
}

/** The candidates holding credits, with a note on why; a line when there are none. */
async function ReservedTab({
  companyId,
  reserved,
}: {
  companyId: string
  reserved: CreditCandidate[] | null
}) {
  const t = await getTranslations("companyBilling")

  return (
    <div className="space-y-4">
      <InfoCard className="max-sm:-mx-6 max-sm:rounded-none">
        {t("reservedNote")}
      </InfoCard>
      {reserved && reserved.length > 0 ? (
        <ReservedList companyId={companyId} initial={reserved} />
      ) : (
        <p className="py-16 text-center text-muted-foreground">
          {t("reservedEmpty")}
        </p>
      )}
    </div>
  )
}
