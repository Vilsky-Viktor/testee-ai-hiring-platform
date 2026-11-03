"use client"

import { useTranslations } from "next-intl"

import { AssistantButton } from "@/features/assistant/components/assistant-button"
import { HeaderSearch, PhoneSearch } from "@/components/common/global-search"
import { useAuth } from "@/providers/auth-provider"
import { LocalizedLink } from "@/components/common/localized-link"
import { NotificationBell } from "@/components/common/notification-bell"
import { SiteMenu } from "@/components/common/site-menu"
import { SiteNav } from "@/components/common/site-nav"
import { ThemeModes } from "@/components/common/theme-toggle"
import { UserMenu } from "@/components/common/user-menu"
import { Wordmark } from "@/components/common/wordmark"

export function SiteHeader() {
  const tc = useTranslations("common")
  const { user, loading } = useAuth()

  return (
    // Exactly 3.5rem including the border.
    <header className="relative h-14 border-b">
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
          {/* Hidden on phones, where it doesn't fit next to Sign in; signed-in users have it in
              their menu. */}
          {!loading && !user && (
            <div className="hidden w-32 sm:block">
              <ThemeModes />
            </div>
          )}
          <AssistantButton />
          <NotificationBell />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
