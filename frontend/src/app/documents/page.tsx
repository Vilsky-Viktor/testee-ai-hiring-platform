import { DownloadIcon, FileTextIcon } from "lucide-react"
import Link from "next/link"
import { getLocale, getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { DOCUMENTS } from "@/config/documents"
import { DEFAULT_LOCALE } from "@/config/i18n"
import { pageMetadata } from "@/lib/site"
import { LIST_BOX, ROW_HOVER, ROW_ICON } from "@/config/lists"
import { PageKey } from "@/components/common/page-key"

export async function generateMetadata() {
  const t = await getTranslations("docs")

  return pageMetadata(t("metaTitle"), t("intro"), "/documents", true)
}

/** Documents for companies to download: instructions, notice and DPIA templates, the DPA. */
export default async function DocsPage() {
  const t = await getTranslations("docs")
  const locale = await getLocale()

  return (
    <main className="mx-auto max-w-page space-y-8 px-6 py-12">
      <PageKey page="documents" />
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-medium tracking-tight">
          {t("title")}
        </h1>
        <p className="text-base text-muted-foreground">
          {t("intro")}
          {/* The documents are English only, like the legal pages. */}
          {locale !== DEFAULT_LOCALE && (
            <span className="block pt-2 text-sm">{t("englishOnly")}</span>
          )}
        </p>
      </header>
      <ul className={`${LIST_BOX} overflow-hidden`} data-testid="documents">
        {DOCUMENTS.map((item) => (
          // On phones the buttons take their own line, across the row.
          <li
            key={item.key}
            className={`group/row flex items-center gap-4 p-6 ${ROW_HOVER} max-sm:flex-wrap`}
          >
            <span aria-hidden className={ROW_ICON}>
              <FileTextIcon className="size-5" />
            </span>
            <div className="min-w-0 flex-1 space-y-1 max-sm:basis-[calc(100%-3.5rem)]">
              <span className="block text-lg font-medium">
                {t(`items.${item.key}.title`)}
              </span>
              <p className="text-sm text-muted-foreground">
                {t(`items.${item.key}.description`)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 max-sm:w-full max-sm:*:flex-1">
              {"online" in item && (
                <Button
                  variant="outline"
                  className="h-10 px-4 text-base"
                  render={<Link href={item.online} />}
                  nativeButton={false}
                >
                  {t("readOnline")}
                </Button>
              )}
              <Button
                variant="outline"
                className="h-10 px-4 text-base"
                data-testid="document-download"
                render={<a href={item.href} download />}
                nativeButton={false}
              >
                <DownloadIcon aria-hidden />
                {t.rich("download", {
                  format: item.format,
                  // The site's buttons are lowercase; a file type isn't.
                  type: (chunks) => <span className="uppercase">{chunks}</span>,
                })}
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
