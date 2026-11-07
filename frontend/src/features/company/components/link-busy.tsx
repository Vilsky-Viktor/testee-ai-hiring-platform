"use client"

import { TimerIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { CompanyLogo } from "@/components/common/company-logo"
import { Button } from "@/components/ui/button"

/** What a candidate sees when a job ad's link is refusing new candidates for now, laid out like
 * the finished page (common/candidate-finished.tsx): how long to wait, as the service said, and
 * a way back to the start. */
export function LinkBusy({
  company,
  logoUrl,
  title,
  seconds,
  onBack,
}: {
  company: string
  logoUrl?: string | null
  title: string
  seconds: number
  onBack: () => void
}) {
  const t = useTranslations("invite")
  const common = useTranslations("common")

  return (
    <div
      data-testid="link-busy"
      className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 py-16 text-center"
    >
      {logoUrl && company && (
        <CompanyLogo
          url={logoUrl}
          name={company}
          className="h-16 w-auto max-w-40 rounded-xl object-contain"
        />
      )}
      <TimerIcon aria-hidden className="size-16 text-primary" />
      <div className="space-y-2">
        <h1 className="font-heading text-4xl font-medium tracking-tight">
          {t("linkBusyTitle")}
        </h1>
        <p className="text-lg text-balance text-muted-foreground normal-case">
          {title}
        </p>
      </div>
      <p className="text-base text-balance">
        {t("linkBusy", { minutes: Math.ceil(seconds / 60) })}
      </p>
      <Button
        variant="outline"
        className="h-10 px-5 text-base"
        onClick={onBack}
      >
        {common("retry")}
      </Button>
    </div>
  )
}
