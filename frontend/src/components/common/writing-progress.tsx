"use client"

import { cn } from "cn"
import { CheckIcon, LoaderCircleIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Progress } from "@/components/ui/progress"
import { LIST_BOX, ROW_HOVER } from "@/config/lists"
import { useEstimatedPercent } from "@/hooks/use-estimated-percent"
import { formatPercent } from "@/lib/format"
import { isFinishing } from "@/lib/poll"
import type { Generation } from "@/types/generation"

/** How far the questions' writing has come: the topics ready and the percent over a bar, then each
 * topic with a spinner until its questions are ready. Batches of questions report only as they
 * end, so the percent is estimated up to a point, until the real one passes it
 * (useEstimatedPercent). At 100% the questions are written, and it says they're being checked and
 * saved. */
export function WritingProgress({
  progress,
  children,
}: {
  progress: NonNullable<Generation["progress"]>
  // The page's buttons: in view above the list, however many topics it has.
  children?: React.ReactNode
}) {
  const t = useTranslations("generation")
  const locale = useLocale()
  const percent = useEstimatedPercent(
    progress.total > 0
      ? Math.min(100, Math.round((progress.done / progress.total) * 100))
      : 0
  )
  const finishing = isFinishing(progress)

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-2">
        <p className="flex justify-between gap-4 text-sm text-muted-foreground tabular-nums">
          <span data-testid="topics-ready">
            {finishing
              ? t("finishing")
              : progress.topics != null &&
                t("topicsReady", {
                  ready: progress.topics_ready ?? 0,
                  count: progress.topics,
                })}
          </span>
          <span>{formatPercent(percent, locale)}</span>
        </p>
        <Progress value={percent} />
      </div>
      {children}
      {progress.topic_states && (
        <ul
          data-testid="topic-states"
          className={`${LIST_BOX} overflow-hidden text-start`}
        >
          {progress.topic_states.map((topic, index) => (
            <li
              key={index}
              data-ready={topic.ready}
              className={`flex items-center gap-3 px-5 py-3.5 ${ROW_HOVER}`}
            >
              {topic.ready ? (
                <CheckIcon
                  aria-hidden
                  className="size-5 shrink-0 text-primary"
                />
              ) : (
                <LoaderCircleIcon
                  aria-hidden
                  className="size-5 shrink-0 animate-spin text-muted-foreground"
                />
              )}
              <span
                dir="auto"
                className={cn(
                  "min-w-0 truncate",
                  !topic.ready && "text-muted-foreground"
                )}
              >
                {topic.name}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
