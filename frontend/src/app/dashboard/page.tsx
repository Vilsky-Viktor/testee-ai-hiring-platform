import { redirect } from "next/navigation"

import { optionalFetch, signedIn } from "@/lib/server-api"
import type { Company } from "@/types/company"

/** Where the header's dashboard link leads: straight into someone's only company, else the
 * companies page, which also has New company (the company's back arrow leads there). */
export default async function DashboardPage() {
  const companies = (await signedIn())
    ? await optionalFetch<Company[]>("/companies/companies?limit=2")
    : null

  redirect(
    companies?.length === 1
      ? `/companies/${companies[0].id}/interviews`
      : "/companies"
  )
}
