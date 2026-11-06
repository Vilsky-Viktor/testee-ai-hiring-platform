"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { TEXT_LINK } from "@/config/links"

/** Shown wherever someone signs in: signing in accepts the terms. */
export function LegalConsent() {
  const t = useTranslations("signIn")

  return (
    <p className="text-center text-sm text-balance text-muted-foreground">
      {/* Two even lines, in any language. */}
      {t.rich("consent", {
        terms: (chunks) => (
          <Link href="/terms" className={TEXT_LINK}>
            {chunks}
          </Link>
        ),
        privacy: (chunks) => (
          <Link href="/privacy" className={TEXT_LINK}>
            {chunks}
          </Link>
        ),
      })}
    </p>
  )
}
