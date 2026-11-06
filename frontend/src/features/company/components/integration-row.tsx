"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"

import { Badge } from "@/components/ui/badge"

import {
  INTEGRATION_LINK,
  INTEGRATION_LOGO,
  INTEGRATION_ROW,
} from "@/config/lists"
import { WARNING_TONE } from "@/config/tones"

/** A connection that stopped working and needs reconnecting, beside its name. */
export function NeedsReconnecting() {
  const t = useTranslations("ats")

  return (
    <Badge
      variant="outline"
      className={`h-8 shrink-0 px-4 text-sm font-light ${WARNING_TONE}`}
      data-testid="needs-reconnecting"
    >
      {t("statusBroken")}
    </Badge>
  )
}

/** One row of the integrations tab, laid out like the companies list: the logo tile the row's
 * full height, the name with its status tag, a line of text; the row opens `href`, the buttons
 * (`actions`, a group of INTEGRATION_ACTIONS) sit on top. On phones the logo is a small tile
 * beside the name, its "⋮" at the end of that line, and a button takes the line under it. */
export function IntegrationRow({
  href,
  logo,
  logoClassName = "",
  name,
  status,
  text,
  actions,
}: {
  href: string
  logo: ReactNode
  logoClassName?: string
  name: ReactNode
  status?: ReactNode
  text?: ReactNode
  actions: ReactNode
}) {
  return (
    <li className={INTEGRATION_ROW}>
      <Link href={href} className={INTEGRATION_LINK}>
        <span className={`${INTEGRATION_LOGO} ${logoClassName}`}>{logo}</span>
        <span className="min-w-0 space-y-1">
          <span className="flex items-center gap-3 text-lg font-medium">
            {name}
            {status}
          </span>
          {text && (
            <span className="block text-base text-muted-foreground">
              {text}
            </span>
          )}
        </span>
      </Link>
      {/* On phones the "⋮" stays on the name's line, at its end, and a button takes the line
          under it. */}
      <span className="relative z-10 max-sm:contents max-sm:*:contents max-sm:[&>*>[data-testid=integration-menu]]:relative max-sm:[&>*>[data-testid=integration-menu]]:z-10 max-sm:[&>*>[data-testid=integration-menu]]:col-start-3 max-sm:[&>*>[data-testid=integration-menu]]:row-start-1 max-sm:[&>*>button:not([data-testid=integration-menu])]:relative max-sm:[&>*>button:not([data-testid=integration-menu])]:z-10 max-sm:[&>*>button:not([data-testid=integration-menu])]:col-span-3 max-sm:[&>*>button:not([data-testid=integration-menu])]:w-full">
        {actions}
      </span>
    </li>
  )
}
