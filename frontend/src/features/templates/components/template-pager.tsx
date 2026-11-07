import { cn } from "cn"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { buttonVariants } from "@/components/ui/button"

/** A public hub's numbered pages as plain links, for search engines and anyone who wants a page
 * of their own; none when the list fits on one. The first page is the hub's own address. */
export async function TemplatePager({
  base,
  current,
  pages,
}: {
  base: string
  current: number
  pages: number
}) {
  const t = await getTranslations("templates")

  if (pages < 2) {
    return null
  }

  return (
    <nav aria-label={t("pages")}>
      <ul className="flex flex-wrap justify-center gap-2">
        {Array.from({ length: pages }, (_, index) => index + 1).map((page) => (
          <li key={page}>
            <Link
              href={page === 1 ? base : `${base}?page=${page}`}
              prefetch={false}
              aria-label={t("pageLink", { page })}
              aria-current={page === current ? "page" : undefined}
              className={cn(
                buttonVariants({
                  variant: page === current ? "secondary" : "ghost",
                }),
                "size-10 p-0 text-base"
              )}
            >
              {page}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
