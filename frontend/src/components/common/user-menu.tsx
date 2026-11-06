"use client"

import {
  DollarSignIcon,
  LayoutDashboardIcon,
  ShieldCogCornerIcon,
  LogInIcon,
  LogOutIcon,
  SettingsIcon,
} from "lucide-react"
import { cn } from "cn"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { useEffect, useState, type ReactNode } from "react"

import { useUrlLocale } from "@/components/common/localized-link"
import { useSignIn } from "@/components/common/sign-in-dialog"
import { useAuth } from "@/providers/auth-provider"
import { ThemeModes } from "@/components/common/theme-toggle"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CopyIdItem } from "@/components/common/copy-id-item"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { apiFetch } from "@/lib/api"
import { belowHeader } from "@/lib/header-line"
import { signOut } from "@/lib/auth"
import { firstGrapheme } from "@/lib/graphemes"
import { localizeHref } from "@/lib/locale-path"

// A menu item, larger than a menu's usual: the account's menu is read at a glance.
const ITEM = "px-3 py-2.5 text-base [&_svg:not([class*='size-'])]:size-5"

/** A menu item opening a page, grey while that page (`section`, its pages too) is the one open,
 * as the side menu marks its own. */
function PageItem({
  href,
  section = href,
  children,
}: {
  href: string
  section?: string
  children: ReactNode
}) {
  const pathname = usePathname()
  // Against the address in the page's language (/de/settings).
  const current = pathname.startsWith(localizeHref(useUrlLocale(), section))

  return (
    <DropdownMenuItem
      className={cn(ITEM, current && "bg-surface")}
      render={<Link href={href} aria-current={current ? "page" : undefined} />}
    >
      {children}
    </DropdownMenuItem>
  )
}

export function UserMenu() {
  const t = useTranslations("userMenu")
  const signIn = useSignIn()
  const { user, loading } = useAuth()
  // The backend says whether this account may open the superadmin pages; kept by account, so a
  // different sign-in never inherits it.
  const [superadminUid, setSuperadminUid] = useState<string | null>(null)
  const superadmin = user !== null && superadminUid === user.uid

  useEffect(() => {
    if (!user) {
      return
    }

    apiFetch<{ is_superadmin: boolean }>("/accounts/me")
      .then((me) => setSuperadminUid(me.is_superadmin ? user.uid : null))
      .catch(() => setSuperadminUid(null))
  }, [user])

  if (loading) {
    return <div className="size-10" />
  }

  if (!user) {
    return (
      // Under 400px, where the header can't fit the label in every language, the icon alone.
      <Button
        variant="outline"
        className="h-10 px-4 max-[399px]:w-8 max-[399px]:px-0 max-md:h-8"
        aria-label={t("signIn")}
        data-testid="header-sign-in"
        onClick={() => signIn()}
      >
        <LogInIcon aria-hidden className="hidden max-[399px]:block" />
        <span aria-hidden className="max-[399px]:hidden">
          {t("signIn")}
        </span>
      </Button>
    )
  }

  const initial = firstGrapheme(
    user.displayName ?? user.email ?? "?"
  ).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-testid="account-menu"
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-xl"
            aria-label={t("account")}
          />
        }
      >
        {/* A rounded square like the site's buttons, with a primary ring on hover and while the
            menu is open. */}
        <Avatar
          size="lg"
          className="rounded-xl gradient-soft group-hover/button:border-primary-gradient group-aria-expanded/button:border-primary-gradient after:rounded-xl"
        >
          <AvatarImage
            src={user.photoURL ?? undefined}
            alt=""
            className="rounded-xl"
          />
          <AvatarFallback className="rounded-xl">{initial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      {/* It hangs from the header's bottom line, centred on its button, its top corners square. */}
      <DropdownMenuContent
        align="center"
        sideOffset={() =>
          belowHeader(document.querySelector('[data-testid="account-menu"]'), 4)
        }
        className={`w-72 rounded-t-none p-3 ring-0`}
      >
        <DropdownMenuGroup>
          <div className="flex items-start gap-1">
            <DropdownMenuLabel className="min-w-0 flex-1 px-3 py-2 text-sm">
              <p className="truncate text-base text-foreground">
                {user.displayName}
              </p>
              <p className="truncate font-normal">{user.email}</p>
            </DropdownMenuLabel>
            {/* The account's id, to quote when writing to testee: an icon at the name's right, a
                menu item reached with the arrow keys too, that stays open to show it copied. */}
            <CopyIdItem id={user.uid} />
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <PageItem href="/dashboard" section="/companies">
          <LayoutDashboardIcon />
          {t("workspace")}
        </PageItem>
        <PageItem href="/top-up">
          <DollarSignIcon />
          {t("topUp")}
        </PageItem>
        {superadmin && (
          <PageItem href="/superadmin/templates" section="/superadmin">
            <ShieldCogCornerIcon />
            {t("adminZone")}
          </PageItem>
        )}
        <PageItem href="/settings">
          <SettingsIcon />
          {t("settings")}
        </PageItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className={ITEM}
          variant="destructive"
          onClick={() => signOut()}
        >
          <LogOutIcon className="rtl:-scale-x-100" />
          {t("signOut")}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="mb-3" />
        <ThemeModes />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
