import { getTranslations } from "next-intl/server"

import type { TemplateSearchParams } from "@/features/templates/components/template-browser"
import { hubPage } from "@/features/templates/utils/templates"
import { pageMetadata } from "@/lib/site"

/** A public hub's metadata (/tests, /practice). A numbered page has its own title and is its own
 * canonical address; it has no language versions, as each language's pages list other rows. */
export async function hubMetadata(
  title: string,
  description: string,
  path: string,
  params: TemplateSearchParams
) {
  const metadata = await pageMetadata(title, description, path, true)
  const page = hubPage(params)

  if (page === 1) {
    return metadata
  }

  const t = await getTranslations("templates")
  const canonical = `${metadata.alternates?.canonical}?page=${page}`

  return {
    ...metadata,
    title: t("pageTitle", { title, page }),
    alternates: { canonical },
    openGraph: {
      ...metadata.openGraph,
      url: canonical,
      alternateLocale: undefined,
    },
  }
}
