"use client"

import { cn } from "cn"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"

import { useAuth } from "@/providers/auth-provider"
import { LocalizedLink, useUrlLocale } from "@/components/common/localized-link"
import { NAV_LINKS } from "@/config/navigation"
import { localizeHref } from "@/lib/locale-path"

/** The site's main links: in a row in the header, or one under another, large, in the phone's
 * menu (`vertical`), where following one closes it (`onNavigate`). */
export function SiteNav({
  vertical = false,
  onNavigate,
}: {
  vertical?: boolean
  onNavigate?: () => void
}) {
  const t = useTranslations("nav")
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const locale = useUrlLocale()

  return (
    // The negative margin cancels the first link's padding, so the separator sits evenly.
    // globals.css finds it by data-slot to add the blue dots; the label is translated.
    <nav
      data-slot="main-nav"
      className={cn(
        vertical
          ? "flex flex-col items-start gap-1"
          : "-ms-1.5 flex h-8 items-center sm:-ms-2.5"
      )}
      aria-label={t("main")}
    >
      {NAV_LINKS.map((link) => {
        if (link.signedInOnly && (loading || !user)) {
          return null
        }

        // Against the address in the page's language (/de/pricing).
        const href = localizeHref(
          locale,
          "section" in link ? link.section : link.href
        )
        const current = link.exact
          ? pathname === href
          : pathname.startsWith(href)

        return (
          <LocalizedLink
            key={link.href}
            href={link.href}
            aria-current={current ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              "rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground active:bg-surface active:text-foreground",
              vertical
                ? "px-3 py-2.5 font-heading text-3xl"
                : "px-1.5 py-1.5 text-sm sm:px-2.5",
              current && "bg-surface text-foreground"
            )}
          >
            {t(link.label)}
          </LocalizedLink>
        )
      })}
    </nav>
  )
}
