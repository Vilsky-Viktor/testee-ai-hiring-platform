"use client"

import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"

import { AssistantButton } from "@/features/assistant/components/assistant-button"
import { HeaderCreate } from "@/components/common/header-create"
import { HeaderSearch, PhoneSearch } from "@/components/common/global-search"
import { useAuth } from "@/providers/auth-provider"
import { LocalizedLink, useUrlLocale } from "@/components/common/localized-link"
import { NotificationBell } from "@/components/common/notification-bell"
import { SiteMenu } from "@/components/common/site-menu"
import { SiteNav } from "@/components/common/site-nav"
import { UserMenu } from "@/components/common/user-menu"
import { Wordmark } from "@/components/common/wordmark"
import { localizeHref } from "@/lib/locale-path"

export function SiteHeader() {
  const tc = useTranslations("common")
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const home = pathname === localizeHref(useUrlLocale(), "/")

  return (
    // Exactly 3.5rem including the border; it stays at the top as the page scrolls.
    <header className="sticky top-0 z-30 h-14 border-b bg-background/80 backdrop-blur">
      {/* Both sides are h-8 boxes centered in the row, so they share one center line. */}
      <div className="mx-auto flex h-full max-w-page items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        {/* The logo and links share a text baseline; the separator stays centered. */}
        <div className="flex items-baseline gap-2 max-sm:items-center sm:gap-4">
          {/* On phones the links are in the menu, left of the logo. */}
          <span className="self-center sm:hidden">
            <SiteMenu />
          </span>
          {/* The link's name is the logo as shown ("t." on phones) plus "Home", so it always
              contains the visible text (WCAG 2.5.3). */}
          <LocalizedLink href="/" className="flex h-8 items-center">
            <Wordmark className="text-xl leading-none" shortOnPhones />
            <span className="sr-only"> {tc("home")}</span>
          </LocalizedLink>
          <span
            aria-hidden
            className="h-5 w-px self-center bg-border max-sm:hidden"
          />
          <span className="max-sm:hidden">
            <SiteNav />
          </span>
        </div>
        <HeaderSearch />
        <div className="flex h-8 items-center gap-3 max-[359px]:gap-1.5">
          <PhoneSearch />
          <AssistantButton />
          <NotificationBell />
          {!loading && !user && <HeaderCreate home={home} />}
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
