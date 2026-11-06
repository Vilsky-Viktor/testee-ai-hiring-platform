"use client"

import { CalendarDaysIcon } from "lucide-react"
import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"

import { useLocalTime } from "@/hooks/use-local-time"
import { VirtualList } from "@/components/common/virtual-list"
import { Progress } from "@/components/ui/progress"
import { LIST_BOX, ROW_HOVER, ROW_ICON } from "@/config/lists"
import { usePagedList } from "@/hooks/use-paged-list"
import type { PracticeRoundSummary } from "@/types/round"
import { formatPercent } from "@/lib/format"

function byRound(round: PracticeRoundSummary) {
  return round.round_id
}

/** A talent's rounds on one practice test, newest first, a page at a time, with their
 * progress and grades; each opens its results. `initial` is the server's first page. */
export function PracticeRoundList({
  templateId,
  initial,
}: {
  templateId: string
  initial: PracticeRoundSummary[]
}) {
  const t = useTranslations("practice")
  const locale = useLocale()
  const localTime = useLocalTime()
  const { items, loadMore } = usePagedList(
    `/rounds/practice/${templateId}/rounds`,
    byRound,
    initial
  )

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">{t("noRounds")}</p>
    )
  }

  return (
    <VirtualList
      items={items}
      getKey={byRound}
      estimateSize={97}
      onEndReached={loadMore}
      className={`${LIST_BOX} overflow-hidden`}
      renderItem={(round) => (
        <Link
          href={`/practice/rounds/${round.round_id}`}
          className={`group/row flex items-center gap-4 p-6 ${ROW_HOVER}`}
        >
          <span aria-hidden className={ROW_ICON}>
            <CalendarDaysIcon className="size-5" />
          </span>
          <span className="min-w-0 flex-1 space-y-1">
            <time
              dateTime={round.started_at}
              className="block text-lg font-medium"
              suppressHydrationWarning
            >
              {localTime.date(round.started_at)}
            </time>
            <span className="block text-sm text-muted-foreground">
              {round.finished ? t("finished") : t("notFinished")}
            </span>
          </span>
          {/* The grade once finished; how far it got until then. */}
          {round.finished ? (
            <span
              data-testid="round-grade"
              className="shrink-0 text-2xl font-light tabular-nums"
            >
              <span className="sr-only">{t("gradeLabel")} </span>
              {formatPercent(round.grade, locale)}
            </span>
          ) : (
            <span
              data-testid="round-progress"
              className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground tabular-nums"
            >
              <Progress
                value={round.progress}
                aria-label={t("progressLabel")}
                className="w-16"
              />
              {formatPercent(round.progress, locale)}
            </span>
          )}
        </Link>
      )}
    />
  )
}
