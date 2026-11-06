"use client"

import { cn } from "cn"
import { UserRoundIcon } from "lucide-react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import type { ReactNode } from "react"

import { useLocalTime } from "@/hooks/use-local-time"
import { CandidateSignals } from "@/components/common/candidate-signals"
import { NoName } from "@/components/common/no-name"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { WrappedEmail } from "@/components/common/wrapped-email"
import { gradeTone } from "@/lib/grade-tone"
import type { Candidate } from "@/types/company"
import { formatPercent } from "@/lib/format"
import { firstGrapheme } from "@/lib/graphemes"
import { hasMessage } from "@/lib/messages"
import { ROW_HOVER, ROW_ICON } from "@/config/lists"

// What a row shows; the assistant's answers may leave out the date or the progress.
export type CandidateRowData = Pick<
  Candidate,
  | "email"
  | "name"
  | "status"
  | "grade"
  | "passed"
  | "tab_leaves"
  | "copies"
  | "fast_answers"
> & { created_at?: string; progress?: number }

/** How far they got: their grade once finished, in the colour of passing or failing; a thin bar
 * while they're on it; nothing before they start. */
function CandidateResult({ candidate }: { candidate: CandidateRowData }) {
  const t = useTranslations("candidates")
  const locale = useLocale()

  if (candidate.grade != null) {
    return (
      <span
        data-testid="candidate-grade"
        className={cn(
          "text-2xl font-light tabular-nums",
          gradeTone(candidate.passed)
        )}
      >
        <span className="sr-only">{t("grade")} </span>
        {formatPercent(candidate.grade, locale)}
      </span>
    )
  }

  if (!candidate.progress) {
    return null
  }

  return (
    <span
      data-testid="candidate-progress"
      className="flex items-center gap-2 text-sm text-muted-foreground tabular-nums"
    >
      <Progress
        value={candidate.progress}
        aria-label={t("progress")}
        className="w-16"
      />
      {formatPercent(candidate.progress, locale)}
    </span>
  )
}

/** One candidate in a list: their initial, name and email (the email alone, with "no name yet",
 * until known), date and integrity signals, result and status, opening `href`, with a `menu` at
 * its end. Side by side when its list is wide enough, stacked in a narrow one (the assistant's
 * panel). */
export function CandidateRow({
  candidate,
  href,
  onClick,
  canEdit = false,
  mode,
  menu,
}: {
  candidate: CandidateRowData
  href: string
  onClick?: () => void
  // An owner or admin, who can enter a missing name on the candidate's page.
  canEdit?: boolean
  // How they take the interview, as an icon, when it's apart from the interview's mode.
  mode?: ReactNode
  menu?: ReactNode
}) {
  const t = useTranslations("candidates")
  const statuses = useTranslations("candidateStatus")
  const localTime = useLocalTime()
  const gone = candidate.status === "deleted"

  return (
    <div className={`group/row @container relative ${ROW_HOVER}`}>
      <div data-row className="flex items-center gap-4 p-4 @xl:p-6">
        <span aria-hidden className={cn(ROW_ICON, "font-medium")}>
          {gone ? (
            <UserRoundIcon className="size-5" />
          ) : (
            firstGrapheme(candidate.name ?? candidate.email).toUpperCase()
          )}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-3 @xl:flex-row @xl:items-center @xl:justify-between @xl:gap-6">
          <div className="min-w-0 space-y-1">
            {/* Its link fills the row; what has a tooltip or a menu stays above it. */}
            <Link
              href={href}
              onClick={onClick}
              className="block text-lg font-medium normal-case after:absolute after:inset-0"
            >
              {gone
                ? t("deleted")
                : (candidate.name ?? <WrappedEmail email={candidate.email} />)}
            </Link>
            {!gone && (
              <span className="block text-sm leading-tight break-all text-muted-foreground">
                {candidate.name ? (
                  candidate.email
                ) : (
                  <span className="relative z-10">
                    <NoName hint={canEdit ? "list" : "view"} />
                  </span>
                )}
              </span>
            )}
            <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {candidate.created_at && (
                <time dateTime={candidate.created_at} suppressHydrationWarning>
                  {localTime.date(candidate.created_at)}
                </time>
              )}
              <span className="relative z-10 flex flex-wrap items-center gap-x-4 gap-y-1">
                {mode}
                <CandidateSignals candidate={candidate} />
              </span>
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-4 @xl:gap-6">
            <CandidateResult candidate={candidate} />
            <Badge
              variant={
                candidate.status === "undelivered" ? "destructive" : "outline"
              }
              className="h-8 px-4 text-sm font-light"
            >
              {hasMessage(statuses, candidate.status)
                ? statuses(candidate.status)
                : candidate.status}
            </Badge>
          </div>
        </div>
        {menu && <div className="relative z-10">{menu}</div>}
      </div>
    </div>
  )
}
