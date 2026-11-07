import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { TemplateBrowser } from "@/features/templates/components/template-browser"
import type { TemplateSearchParams } from "@/features/templates/components/template-browser"
import { hubMetadata } from "@/features/templates/utils/hub-metadata"
import { DEFAULT_LOCALE } from "@/config/i18n"
import { localizedPath } from "@/lib/locale-path"
import { urlLocale } from "@/lib/site"
import { PUBLIC_TEMPLATES_PATH } from "@/config/lists"
import { PageKey } from "@/components/common/page-key"

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<TemplateSearchParams>
}) {
  const t = await getTranslations("tests")

  return hubMetadata(t("title"), t("intro"), "/tests", await searchParams)
}

/** Skills tests by role for companies: every template, searched like the practice list, each
 * opening its role test page. */
export default async function TestsPage({
  searchParams,
}: {
  searchParams: Promise<TemplateSearchParams>
}) {
  const t = await getTranslations("tests")
  // Links stay in the language of the page's address.
  const locale = (await urlLocale()) ?? DEFAULT_LOCALE
  const at = (path: string) => localizedPath(locale, path)
  const browser = await TemplateBrowser({
    // A search stays in the language of the address it started on.
    base: at("/tests"),
    listPath: PUBLIC_TEMPLATES_PATH,
    params: await searchParams,
    openBase: "/tests",
    bySlug: true,
    topicsLine: true,
  })

  return (
    <main className="mx-auto max-w-page space-y-8 px-6 py-12">
      <PageKey page="tests" />
      {/* The title with the main action on the right, like the app's other lists; on phones the
          button takes its own line. */}
      <div className="flex items-center justify-between gap-6 max-sm:flex-col max-sm:items-stretch">
        <div className="min-w-0 space-y-2">
          <h1 className="font-heading text-3xl font-medium tracking-tight">
            {t("title")}
          </h1>
          <p className="text-base text-muted-foreground">{t("intro")}</p>
        </div>
        <Button
          className="h-12 shrink-0 px-6 text-base"
          render={<Link href={at("/")} />}
          nativeButton={false}
        >
          {t("createOwn")}
        </Button>
      </div>
      {browser}
    </main>
  )
}
