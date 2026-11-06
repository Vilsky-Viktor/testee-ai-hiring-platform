import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { StartingView } from "@/features/generation/components/starting-view"
import { PageKey } from "@/components/common/page-key"
import { SignInPage } from "@/components/common/sign-in-page"
import { serverFetch, signedIn } from "@/lib/server-api"
import type { Company } from "@/types/company"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("generation")

  return { title: t("title") }
}

/** An interview being made from the home page's start: opened at once on Continue, it makes the
 * interview kept in the tab, then the generation's own page takes over. */
export default async function StartingPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>
}) {
  if (!(await signedIn())) {
    return <SignInPage />
  }

  const { company: id } = await searchParams
  const company = id
    ? await serverFetch<Company>(`/companies/companies/${id}`)
    : null

  return (
    <main className="mx-auto flex w-full max-w-page flex-1 flex-col space-y-8 px-6 py-12">
      <PageKey page="generating" />
      <StartingView companyName={company?.name} />
    </main>
  )
}
