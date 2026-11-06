import { cookies } from "next/headers"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"

import { CompanyCredits as CreditsPanel } from "@/features/company/components/company-credits"
import { CompanyHeader } from "@/features/company/components/company-header"
import { InterviewList } from "@/features/company/components/interview-list"
import { InterviewFilter } from "@/features/company/components/interview-filter"
import { InterviewSearch } from "@/features/company/components/interview-search"
import { InterviewStart } from "@/features/company/components/interview-start"
import { SearchedList } from "@/components/common/searched-list"
import { SignInPrompt } from "@/components/common/sign-in-prompt"
import { Button } from "@/components/ui/button"
import { TOKEN_COOKIE } from "@/config/auth"
import { PAGE_SIZE } from "@/config/lists"
import { isPaused } from "@/lib/pause"
import { optionalFetch, serverFetch } from "@/lib/server-api"
import { translatedTitle } from "@/lib/site"
import { companyHeaderProps } from "@/lib/company-header"
import type { CompanyCredits } from "@/types/billing"
import type { Company, Interview, InterviewStatusCounts } from "@/types/company"

export const generateMetadata = () => translatedTitle("interviews", "title")

/** A company's interviews, searched by title (`?q=`, kept in the address like the templates'). */
export default async function InterviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ companyId: string }>
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const { companyId } = await params
  const query = await searchParams
  const q = query.q?.trim() ?? ""
  const status = query.status ?? ""
  const searchPart = q ? `&q=${encodeURIComponent(q)}` : ""
  const listPath = `/companies/interviews?company_id=${companyId}&sort=activity${searchPart}${status ? `&status=${encodeURIComponent(status)}` : ""}`
  const t = await getTranslations("interviews")
  const signedIn = (await cookies()).has(TOKEN_COOKIE)
  // Asked together: the API refuses each on its own when the company isn't theirs.
  const [company, interviews, credits, counts, paused] = signedIn
    ? await Promise.all([
        serverFetch<Company>(`/companies/companies/${companyId}`),
        serverFetch<Interview[]>(`${listPath}&limit=${PAGE_SIZE}`),
        optionalFetch<CompanyCredits>(
          `/companies/companies/${companyId}/credits`
        ),
        optionalFetch<InterviewStatusCounts>(
          `/companies/interviews/status-counts?company_id=${companyId}${searchPart}`
        ),
        isPaused(),
      ])
    : [null, null, null, null, false]

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
        current="interviews"
        action={
          <div className="flex shrink-0 items-center gap-6 max-sm:flex-col max-sm:items-stretch max-sm:gap-3">
            {credits != null && (
              <CreditsPanel
                companyId={companyId}
                credits={credits.available}
                low={credits.low}
                canEdit={company.can_edit}
              />
            )}
            {company.can_edit && (
              <Button
                render={
                  <Link href={`/companies/${companyId}/interviews/new`} />
                }
                nativeButton={false}
                className="h-12 px-6 text-base"
              >
                {t("new")}
              </Button>
            )}
          </div>
        }
      >
        <Interviews
          companyId={companyId}
          canEdit={company.can_edit}
          paused={paused}
          q={q}
          status={status}
          counts={counts}
          path={listPath}
          initial={interviews}
        />
      </CompanyHeader>
    </main>
  )
}

/** The company's interviews under their filter and search, or, with none yet, the start of one,
 * as the home page has it, right here. */
async function Interviews({
  companyId,
  canEdit,
  paused,
  q,
  status,
  counts,
  path,
  initial,
}: {
  companyId: string
  canEdit: boolean
  paused: boolean
  q: string
  status: string
  counts: InterviewStatusCounts | null
  path: string
  initial: Interview[] | null
}) {
  const t = await getTranslations("interviews")

  if (counts?.all === 0 && !q && canEdit) {
    return (
      <div className="mx-auto w-full max-w-176 space-y-6 py-8">
        <h2 className="font-heading text-3xl font-medium tracking-tight">
          {t("createTitle")}
        </h2>
        <InterviewStart companyId={companyId} paused={paused} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {counts && (
        <InterviewFilter
          href={`/companies/${companyId}/interviews`}
          q={q}
          status={status}
          counts={counts}
        />
      )}
      <SearchedList>
        <InterviewSearch q={q} />
        {initial && (
          <InterviewList
            companyId={companyId}
            path={path}
            initial={initial}
            canEdit={canEdit}
            searched={Boolean(q || status)}
          />
        )}
      </SearchedList>
    </div>
  )
}
