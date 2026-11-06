"use client"

import { CircleCheckIcon } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"

import { CompanyLogo } from "@/components/common/company-logo"
import { SummaryCards } from "@/components/common/summary-cards"
import { TEXT_LINK } from "@/config/links"
import { bdi } from "@/lib/bidi"

/** What a candidate sees once they've finished, right after the last question and on their link
 * again: that they're done, what happens next, the record of it when known (never a grade), and
 * that a person can review their result; a member's `preview` says it was only a try. `action`
 * is a way back. A practice round has none of this: it opens its results, with every answer. */
export function CandidateFinished({
  company,
  logoUrl,
  title,
  answered,
  minutes,
  preview = false,
  action,
}: {
  company?: string
  logoUrl?: string | null
  title: string
  // The questions they answered, out of how many.
  answered?: { done: number; total: number }
  // How long it took.
  minutes?: number | null
  // A company member's try, as a candidate: nothing goes to anyone, and no result is reviewed.
  preview?: boolean
  action?: ReactNode
}) {
  const t = useTranslations("invite")
  const session = useTranslations("session")
  const named = { company: company || t("theCompany"), ...bdi }
  const rows = [
    ...(answered
      ? [
          {
            id: "questions-answered",
            label: t("finishedAnswered"),
            value: session("answeredOf", {
              done: answered.done,
              total: answered.total,
            }),
          },
        ]
      : []),
    ...(minutes
      ? [
          {
            id: "time-taken",
            label: t("finishedTime"),
            value: `${minutes} ${t("minutesUnit")}`,
          },
        ]
      : []),
  ]

  return (
    <div
      data-testid="candidate-finished"
      className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 py-16 text-center"
    >
      {logoUrl && company && (
        <CompanyLogo
          url={logoUrl}
          name={company}
          className="h-16 w-auto max-w-40 rounded-xl object-contain"
        />
      )}
      <CircleCheckIcon
        aria-hidden
        className="size-16 text-primary motion-safe:animate-[finish-pop_0.5s_cubic-bezier(0.2,0.9,0.3,1.3)_both]"
      />
      <div className="space-y-2">
        <h1 className="font-heading text-4xl font-medium tracking-tight">
          {t("finishedTitle")}
        </h1>
        <p className="text-lg text-balance text-muted-foreground normal-case">
          {title}
        </p>
      </div>
      <p className="text-base text-balance">
        {preview ? t("finishedPreview") : t.rich("finished", named)}
      </p>
      {rows.length > 0 && (
        <SummaryCards
          testId="finished-summary"
          className={`w-full text-start ${rows.length > 1 ? "sm:grid-cols-2!" : "grid-cols-1! sm:grid-cols-1!"}`}
          rows={rows}
        />
      )}
      {action}
      {!preview && (
        <p className="text-sm text-balance text-muted-foreground">
          {t.rich("finishedRights", {
            ...named,
            link: (chunks) => (
              <Link
                href="/privacy"
                target="_blank"
                rel="noopener"
                className={TEXT_LINK}
              >
                {chunks}
              </Link>
            ),
          })}
        </p>
      )}
    </div>
  )
}
