"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { BackLink } from "@/components/common/back-link"
import { Button } from "@/components/ui/button"

/** A generation page's state with the way back beside its content. */
export function WithBack({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <BackLink href={href}>{label}</BackLink>
      {children}
    </div>
  )
}

/** What happened to a generation (gone, cancelled, failed, refused), a retry when it can be
 * tried again, and a way to start over (`back`). */
export function Message({
  back,
  text,
  onRetry,
}: {
  // The company's tests, where a new one can be started.
  back: string
  text: string
  onRetry?: () => Promise<void>
}) {
  const t = useTranslations("generation")
  const [retrying, setRetrying] = useState(false)

  async function retry() {
    setRetrying(true)
    await onRetry?.()
    setRetrying(false)
  }

  return (
    <div className="flex flex-col items-center gap-8 py-24 text-center">
      {/* A service's message keeps its own line breaks. */}
      <p className="text-base whitespace-pre-line text-muted-foreground">
        {text}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {onRetry && (
          <Button
            className="h-12 px-6 text-base"
            disabled={retrying}
            onClick={retry}
          >
            {retrying ? t("retrying") : t("retry")}
          </Button>
        )}
        <Button
          variant="outline"
          className="h-12 px-6 text-base"
          render={<Link href={back} />}
          nativeButton={false}
        >
          {t("startOver")}
        </Button>
      </div>
    </div>
  )
}
