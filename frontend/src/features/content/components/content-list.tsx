import { ChevronRightIcon, type LucideIcon } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { LocalizedLink } from "@/components/common/localized-link"
import type { ContentPage } from "@/lib/content"
import { LIST_BOX, ROW_HOVER, ROW_ICON } from "@/config/lists"
import { formatDay } from "@/lib/format"

/** A hub's pages as one list, like the companies list: each with `icon`, its title and description
 * (in its own language) and when it was last updated, opening the page under `base` in the
 * address's language. */
export async function ContentList({
  pages,
  base,
  icon: Icon,
}: {
  pages: ContentPage[]
  base: string
  icon: LucideIcon
}) {
  const t = await getTranslations("content")
  const locale = await getLocale()

  return (
    <ul className={`${LIST_BOX} overflow-hidden`} data-testid="content-list">
      {pages.map((page) => (
        <li key={page.slug} lang={page.language}>
          <LocalizedLink
            href={`${base}/${page.slug}`}
            className={`group/row flex items-center gap-4 p-6 ${ROW_HOVER}`}
          >
            <span aria-hidden className={ROW_ICON}>
              <Icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1 space-y-1">
              <span className="block text-lg font-medium">{page.title}</span>
              <span className="block text-base text-muted-foreground">
                {page.description}
              </span>
              <span className="block text-sm text-muted-foreground italic">
                {t("updated")}{" "}
                <time dateTime={page.updated}>
                  {formatDay(page.updated, locale)}
                </time>
              </span>
            </span>
            <ChevronRightIcon
              aria-hidden
              className="size-5 shrink-0 text-muted-foreground transition-transform group-hover/row:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/row:-translate-x-0.5"
            />
          </LocalizedLink>
        </li>
      ))}
    </ul>
  )
}
