"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"

import { useLocalTime } from "@/hooks/use-local-time"
import { InterviewStatus } from "@/components/common/interview-status"
import { PinnedNote } from "@/components/common/pinned-note"
import { ShortNumber } from "@/components/common/short-number"
import { WARNING_TONE } from "@/config/tones"
import { AnswerModeIcon } from "@/features/company/components/answer-mode-icon"
import type { Interview } from "@/types/company"

/** An interview's row content: its title, the one thing to know about it now, its pinned note
 * and date, then its status (when it has one), how many candidates it has, finished and passed.
 * On phones the numbers go under the title. */
export function InterviewSummary({
  interview,
  title,
}: {
  interview: Interview
  title: string
}) {
  const t = useTranslations("interviews")
  const localTime = useLocalTime()
  const rowStatus = interview.row_status
  const stats = [
    ["candidate-count", "candidatesShort", interview.candidate_count],
    ["finished-count", "finishedShort", interview.finished_count ?? 0],
    ["passed-count", "passedShort", interview.passed_count ?? 0],
  ] as const

  return (
    <span className="flex min-w-0 flex-1 items-center justify-between gap-6 max-sm:flex-col max-sm:items-start max-sm:gap-2">
      <span className="min-w-0 space-y-1">
        {/* How it's answered, after the title's last word, wrapping with it. The title in its
            own element, so its text is the title alone. */}
        <span className="block text-lg font-medium">
          <span>{title}</span>
          {"\u2060"}
          <AnswerModeIcon voice={interview.voice ?? false} className="ms-2" />
        </span>
        {rowStatus && (
          <span
            data-testid="interview-row-status"
            data-status={rowStatus}
            className={cn(
              "block text-sm text-muted-foreground",
              ["failed", "undelivered"].includes(rowStatus) && WARNING_TONE
            )}
          >
            {t.rich(`rowStatus.${rowStatus}`, {
              count:
                rowStatus === "undelivered"
                  ? (interview.undelivered_count ?? 0)
                  : (interview.recent_count ?? 0),
              n: () => (
                <ShortNumber
                  value={
                    rowStatus === "undelivered"
                      ? (interview.undelivered_count ?? 0)
                      : (interview.recent_count ?? 0)
                  }
                />
              ),
            })}
          </span>
        )}
        {interview.pinned_note && (
          <PinnedNote text={interview.pinned_note} className="text-sm" />
        )}
        <span className="block text-sm text-muted-foreground">
          <time dateTime={interview.created_at} suppressHydrationWarning>
            {localTime.date(interview.created_at)}
          </time>
        </span>
      </span>
      <span
        data-slot="interview-stats"
        className="relative z-10 flex shrink-0 flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground tabular-nums"
      >
        {/* Still generating: no status yet. */}
        {interview.set_id && <InterviewStatus status={interview.status} />}
        {stats.map(([id, message, value]) => (
          <span key={id} data-testid={id}>
            {t.rich(message, {
              count: value,
              n: () => <ShortNumber value={value} />,
            })}
          </span>
        ))}
      </span>
    </span>
  )
}
