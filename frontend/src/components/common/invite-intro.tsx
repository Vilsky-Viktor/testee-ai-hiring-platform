"use client"

import { cn } from "cn"
import { useLocale, useTranslations } from "next-intl"
import type { ReactNode } from "react"

import { CandidateFinished } from "@/components/common/candidate-finished"
import { CompanyLogo } from "@/components/common/company-logo"
import { VerifiedBadge } from "@/components/common/verified-badge"
import { SummaryCards } from "@/components/common/summary-cards"
import { Progress } from "@/components/ui/progress"
import { InviteRules } from "@/components/common/invite-rules"
import { bdi } from "@/lib/bidi"
import { formatPercent } from "@/lib/format"

/** What a candidate sees before starting: who invited them, the test, the time per question, how
 * far they got on their way back and the rules, then `action` (the start button). A company member's preview shows the same. */
export function InviteIntro({
  company,
  logoUrl,
  verifiedDomain,
  title,
  questionSeconds,
  totalMinutes,
  finished,
  progress,
  voice = false,
  viaLink = false,
  fillScreen,
  back,
  action,
}: {
  company: string
  // The inviting company's logo, above who invited them.
  logoUrl?: string | null
  // Its verified domain: the badge beside its name.
  verifiedDomain?: string | null
  title: string | null
  questionSeconds: number
  // The whole interview at that pace, in minutes; left out while it isn't known.
  totalMinutes?: number | null
  finished: boolean
  // How far they got, in percent, on their way back.
  progress?: number | null
  // Taken by voice: a rule says the questions are read aloud and the voice is never kept.
  voice?: boolean
  // Opened from the test's shareable link: their own link comes by email, and extra time needs
  // a personal invite.
  viaLink?: boolean
  // Fills the screen from md up unless false: false inside a company's own site (the embed),
  // whose frame grows to fit its content, so a height taken from the frame would grow it without
  // end.
  fillScreen?: boolean
  // A member's way back (the back arrow), at the top of the test's column, so it never pushes
  // the full-height rules down.
  back?: ReactNode
  action: ReactNode
}) {
  const t = useTranslations("invite")
  const locale = useLocale()
  const height = screenHeight(fillScreen !== false)
  // Its own page on a phone, where the start stays in reach; a preview, an embedded page and the
  // voice step (too tall to pin) leave it in the flow.
  const pinned = fillScreen !== false && !back && !voice

  const header = (
    <InviteHeader
      company={company}
      logoUrl={logoUrl}
      verifiedDomain={verifiedDomain}
      title={title}
      back={back}
    />
  )

  if (finished) {
    return (
      <CandidateFinished
        company={company}
        logoUrl={logoUrl}
        title={title ?? t("fallbackTitle")}
      />
    )
  }

  // The test and its start on the left, the rules on the right; stacked on phones, the start
  // after the rules.
  return (
    // From md up the grid fills the screen (these pages have no header), so the rules can run its
    // full height.
    <div
      className={cn(
        "grid w-full items-center gap-10 max-md:text-center md:grid-cols-[5fr_6fr] md:gap-16",
        height.grid
      )}
    >
      <div className="space-y-8 text-center max-md:contents">
        {header}
        {/* The time per question and, when known, the whole interview's, side by side. */}
        <SummaryCards
          className={cn(
            "text-start",
            totalMinutes ? "sm:grid-cols-2!" : "grid-cols-1! sm:grid-cols-1!"
          )}
          rows={[
            {
              id: "time-per-question",
              label: t("timePerQuestion"),
              value: `${questionSeconds} ${t("secondsUnit")}`,
            },
            ...(totalMinutes
              ? [
                  {
                    id: "total-minutes",
                    label: t("wholeInterview"),
                    value: `${totalMinutes} ${t("minutesUnit")}`,
                  },
                ]
              : []),
          ]}
        />
        {/* How far they got, on their way back. */}
        {Boolean(progress) && (
          <div data-testid="invite-progress" className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t("progress", {
                percent: formatPercent(progress ?? 0, locale),
              })}
            </p>
            <Progress value={progress ?? 0} aria-label={t("progressLabel")} />
          </div>
        )}
        {/* On phones it stays at the bottom of the screen, whatever's being read above it. */}
        <div
          data-testid="invite-action"
          className={cn(
            "max-md:order-last",
            pinned &&
              "z-20 border-t bg-background p-4 max-md:fixed max-md:inset-x-0 max-md:bottom-0 md:border-t-0 md:bg-transparent md:p-0 max-md:[&_[data-slot=button]]:w-full"
          )}
        >
          {action}
        </div>
      </div>
      <InviteRules
        company={company}
        voice={voice}
        viaLink={viaLink}
        className={cn(pinned && "max-md:mb-36", height.rules)}
      />
    </div>
  )
}

/** From md up the page fills the screen and the rules scroll within it; embedded, neither. */
function screenHeight(fill: boolean) {
  return fill
    ? { grid: "md:min-h-dvh", rules: "md:max-h-dvh" }
    : { grid: "", rules: "" }
}

/** Who invited them, whether testee has checked that company, and the test. */
function InviteHeader({
  company,
  logoUrl,
  verifiedDomain,
  title,
  back,
}: {
  company: string
  logoUrl?: string | null
  verifiedDomain?: string | null
  title: string | null
  back?: ReactNode
}) {
  const t = useTranslations("invite")

  return (
    <div className="space-y-4">
      {back}
      {/* The logo, with who invited them under it, centered together. */}
      {company && (
        <div className="flex flex-col items-center justify-center gap-4 pb-3">
          {logoUrl && (
            <CompanyLogo
              url={logoUrl}
              name={company}
              className="h-28 w-auto max-w-56 shrink-0 rounded-xl object-contain"
            />
          )}
          <p className="text-base text-muted-foreground">
            {t.rich("invitedYou", {
              company,
              ...bdi,
              b: (chunks) => (
                <span className="font-medium text-foreground">
                  {chunks}
                  {verifiedDomain && (
                    <VerifiedBadge
                      domain={verifiedDomain}
                      className="ms-1 size-4"
                    />
                  )}
                </span>
              ),
            })}
          </p>
        </div>
      )}
      {/* Small and quiet, yet readable (4.5:1): testee hasn't checked who this company is. */}
      {company && !verifiedDomain && (
        <p className="text-xs text-muted-foreground">{t("unverified")}</p>
      )}
      <h1
        className={cn(
          "font-heading text-3xl leading-[1.15] font-medium tracking-tight text-balance sm:text-4xl sm:leading-[1.15]",
          title && "normal-case"
        )}
      >
        {title ?? t("fallbackTitle")}
      </h1>
    </div>
  )
}
