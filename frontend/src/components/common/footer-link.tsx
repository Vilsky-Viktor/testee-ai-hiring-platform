"use client"

import { cn } from "cn"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { LocalizedLink, useUrlLocale } from "@/components/common/localized-link"
import { localizeHref } from "@/lib/locale-path"

/** A link of the footer's menu, marked while its page, or a page under it, is open, like the
 * header's. */
export function FooterLink({
  href,
  children,
}: {
  href: string
  children: ReactNode
}) {
  const pathname = usePathname()
  // Against the address in the page's language (/de/pricing).
  const own = localizeHref(useUrlLocale(), href)
  const current = pathname === own || pathname.startsWith(`${own}/`)

  return (
    <LocalizedLink
      href={href}
      aria-current={current ? "page" : undefined}
      className={cn(
        "-mx-1.5 rounded-lg px-1.5 py-0.5 transition-colors hover:text-foreground active:bg-surface active:text-foreground",
        current && "text-foreground"
      )}
    >
      {children}
    </LocalizedLink>
  )
}
