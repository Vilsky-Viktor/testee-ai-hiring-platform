import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { ActionFilters } from "@/features/company/components/action-filters"
import { ActionList } from "@/features/company/components/action-list"
import { ActionsMenu } from "@/features/company/components/actions-menu"
import { CompanyHeader } from "@/features/company/components/company-header"
import { FilterPills } from "@/components/common/filter-pills"
import { SignInPrompt } from "@/components/common/sign-in-prompt"
import { TOKEN_COOKIE } from "@/config/auth"
import { ACTION_GROUPS } from "@/config/action-log"
import { PAGE_SIZE } from "@/config/lists"
import { actionFilters } from "@/lib/action-log"
import { serverFetch } from "@/lib/server-api"
import { translatedTitle } from "@/lib/site"
import { companyHeaderProps } from "@/lib/company-header"
import type {
  Company,
  CompanyAction,
  CompanyMember,
  Interview,
} from "@/types/company"

export const generateMetadata = () => translatedTitle("company", "actions")

/** The address of the log with `group` chosen (all with none), keeping the other filters. */
function withGroup(href: string, filters: URLSearchParams, group?: string) {
  const params = new URLSearchParams(filters)

  if (group) {
    params.set("group", group)
  } else {
    params.delete("group")
  }

  return params.size ? `${href}?${params}` : href
}

/** The company's action log, for its owner only: every action its members took, newest first,
 * filtered by member, group of actions and days (the filters are in the address). */
export default async function ActionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ companyId: string }>
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { companyId } = await params
  const asked = await searchParams
  const filters = actionFilters(asked)
  const path = `/companies/companies/${companyId}/actions${filters.size ? `?${filters}` : ""}`
  const t = await getTranslations("actionLog")
  const signedIn = (await cookies()).has(TOKEN_COOKIE)
  const company = signedIn
    ? await serverFetch<Company>(`/companies/companies/${companyId}`)
    : null
  const [members, first, interviews] = company?.can_see_actions
    ? await Promise.all([
        // Without a limit, the API's largest page: every member.
        serverFetch<CompanyMember[]>(
          `/companies/members?company_id=${companyId}`
        ),
        serverFetch<CompanyAction[]>(
          `${path}${filters.size ? "&" : "?"}limit=${PAGE_SIZE}`
        ),
        // The newest interviews for the bias-audit export's picker, which finds any other.
        serverFetch<Interview[]>(
          `/companies/interviews?company_id=${companyId}&limit=100`
        ),
      ])
    : [null, null, null]

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

  // Admins and viewers have no action log.
  if (!company.can_see_actions) {
    redirect(`/companies/${companyId}/interviews`)
  }

  return (
    <main className="mx-auto max-w-page space-y-8 px-6 py-12">
      <CompanyHeader
        {...companyHeaderProps(company)}
        companyId={companyId}
        current="actions"
        smallAction
        action={
          <ActionsMenu companyId={companyId} interviews={interviews ?? []} />
        }
      >
        <FilterPills
          testId="action-groups"
          items={[undefined, ...ACTION_GROUPS].map((group) => ({
            id: group ?? "all",
            label: group ? t(`groups.${group}`) : t("anyAction"),
            href: withGroup(`/companies/${companyId}/actions`, filters, group),
            chosen: group === asked.group,
          }))}
        />
        <ActionFilters
          members={(members ?? []).filter((member) => member.joined)}
        />
        <ActionList
          path={path}
          initial={first ?? []}
          narrowed={filters.size > 0}
          companyId={companyId}
        />
      </CompanyHeader>
    </main>
  )
}
