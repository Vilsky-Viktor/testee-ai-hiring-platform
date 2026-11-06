import { cookies } from "next/headers"
import { getTranslations } from "next-intl/server"

import { BackLink } from "@/components/common/back-link"
import { FirstCompany } from "@/features/company/components/first-company"
import { CreateCompany } from "@/features/company/components/create-company"
import { CompanyList } from "@/features/company/components/company-list"
import { SearchField } from "@/components/common/search-field"
import { SearchedList } from "@/components/common/searched-list"
import { PageHeader } from "@/components/common/page-header"
import { SignInPrompt } from "@/components/common/sign-in-prompt"
import { TOKEN_COOKIE } from "@/config/auth"
import { COMPANIES_SEARCH_FROM, PAGE_SIZE } from "@/config/lists"
import { MAX_SEARCH_LENGTH } from "@/config/limits"
import { serverFetch } from "@/lib/server-api"
import { translatedTitle } from "@/lib/site"
import type { Company } from "@/types/company"

export const generateMetadata = () => translatedTitle("company", "page")

export default async function CompanyPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const signedIn = (await cookies()).has(TOKEN_COOKIE)
  const t = await getTranslations("company")
  const common = await getTranslations("common")
  const q = (await searchParams).q?.trim() ?? ""
  const listPath = `/companies/companies${q ? `?q=${encodeURIComponent(q)}` : ""}`
  // The first page renders on the server; the rest load as the user scrolls.
  const companies = signedIn
    ? await serverFetch<Company[]>(
        `${listPath}${q ? "&" : "?"}limit=${PAGE_SIZE}`
      )
    : null
  const none = companies?.length === 0 && !q

  return (
    <main className="mx-auto max-w-page space-y-8 px-6 py-12">
      <PageHeader
        back={
          <BackLink href="/" help="companies">
            {common("home")}
          </BackLink>
        }
        title={
          // On phones "new company" goes under the title, at full width.
          <div className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-stretch">
            <h1 className="font-heading text-3xl font-medium tracking-tight">
              {t("title")}
            </h1>
            {signedIn && !none && <CreateCompany />}
          </div>
        }
      />

      {!signedIn && <SignInPrompt />}

      {none && <FirstCompany />}

      {companies && !none && (
        <Companies companies={companies} path={listPath} q={q} />
      )}
    </main>
  )
}

/** The list, under a search once there are many. */
async function Companies({
  companies,
  path,
  q,
}: {
  companies: Company[]
  path: string
  q: string
}) {
  const t = await getTranslations("company")
  const list = <CompanyList key={q} path={path} initial={companies} />

  if (!q && companies.length < COMPANIES_SEARCH_FROM) {
    return list
  }

  return (
    <SearchedList>
      <SearchField q={q} label={t("search")} maxLength={MAX_SEARCH_LENGTH} />
      {list}
    </SearchedList>
  )
}
