import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { BackLink } from "@/components/common/back-link"
import { PageHeader } from "@/components/common/page-header"
import { SignInPage } from "@/components/common/sign-in-page"
import { CompanyPicker } from "@/features/generation/components/company-picker"
import { DraftLine } from "@/features/generation/components/draft-line"
import { visitorCatalog } from "@/lib/catalog"
import { serverFetch, signedIn } from "@/lib/server-api"
import type { Company } from "@/types/company"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("start")

  return { title: t("whichCompany") }
}

/** Which company an interview described on the home page is for, under a line of the description:
 * one of the user's, which starts it there at once (app/generate/new), or a new one; someone with
 * none is only asked what theirs is called, and told of the free candidates. The arrow goes back
 * to the description, kept as typed. */
export default async function StartCompanyPage() {
  if (!(await signedIn())) {
    return <SignInPage />
  }

  const t = await getTranslations("start")
  const common = await getTranslations("common")
  // Only those the user may create an interview in, not those they only view.
  const companies = (
    (await serverFetch<Company[]>("/companies/companies?limit=100")) ?? []
  ).filter((company) => company.can_edit)
  const first = companies.length === 0
  const freeCandidates = first
    ? ((await visitorCatalog())?.free_candidates ?? null)
    : null

  return (
    <main className="mx-auto max-w-page px-6 py-12">
      {/* A narrow column in the middle: the question, the list and its button. */}
      <div className="mx-auto max-w-xl space-y-8">
        <PageHeader
          back={
            <BackLink href="/" help="newInterview">
              {common("home")}
            </BackLink>
          }
          title={
            // A question: no blue dot after its question mark.
            <h1 className="no-dot font-heading text-3xl font-medium tracking-tight">
              {t(first ? "firstCompany" : "whichCompany")}
            </h1>
          }
        >
          <DraftLine />
        </PageHeader>
        <CompanyPicker companies={companies} freeCandidates={freeCandidates} />
      </div>
    </main>
  )
}
