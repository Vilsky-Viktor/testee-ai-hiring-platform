"use client"

import { cn } from "cn"
import { ChevronDownIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { type ReactNode, useState } from "react"

import { PillChoice } from "@/components/common/pill-choice"
import { Progress } from "@/components/ui/progress"
import { ROW_HOVER, ROW_ICON } from "@/config/lists"
import { formatPercent } from "@/lib/format"
import { gradeTone } from "@/lib/grade-tone"
import { languageOf } from "@/lib/locale"

type AnswerFilter = "all" | "correct" | "wrong"
type Answered = {
  question_id: string
  answer?: { correct?: boolean | null } | null
}

/** One topic of a result, as a row of a list: its grade and bar, opening to its questions, closed
 * at first, narrowed to all, the right or the wrong ones (a partly right answer counts as wrong).
 * `meta` goes under its title; `passed`, when known, colours the grade. The questions are a plain
 * list: it mounts down the page, where a virtual one moves the page. */
export function TopicDisclosure<Item extends Answered>({
  title,
  language,
  score,
  passed,
  meta,
  items,
  renderItem,
  opened = false,
  target,
}: {
  title: string
  language?: string | null
  score: number | null | undefined
  passed?: boolean | null
  meta?: ReactNode
  items: Item[]
  renderItem: (item: Item) => ReactNode
  // Shown open from outside, and the name for its pointer (a landing picture's).
  opened?: boolean
  target?: string
}) {
  const t = useTranslations("scorecard")
  const questions = useTranslations("questions")
  const locale = useLocale()
  const [toggled, setOpen] = useState(false)
  const open = toggled || opened
  const [filter, setFilter] = useState<AnswerFilter>("all")
  const shown = items.filter(
    (item) =>
      filter === "all" ||
      Boolean(item.answer?.correct) === (filter === "correct")
  )

  return (
    <li>
      <button
        type="button"
        aria-expanded={open}
        data-testid="topic-toggle"
        data-demo-target={target}
        onClick={() => setOpen(!open)}
        className={`group/row flex w-full cursor-pointer items-center gap-4 p-6 text-start ${ROW_HOVER}`}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <span className="min-w-0 space-y-1">
            <span
              {...languageOf(language)}
              className="block text-lg font-medium normal-case"
            >
              {title}
            </span>
            {meta}
          </span>
          <span className="flex shrink-0 items-center gap-3">
            <Progress
              value={score ?? 0}
              aria-label={title}
              className="w-32 sm:w-40"
            />
            <span
              className={cn(
                "w-14 text-end text-2xl font-light tabular-nums",
                score == null ? "text-muted-foreground" : gradeTone(passed)
              )}
            >
              {formatPercent(score, locale)}
            </span>
          </span>
        </span>
        <span aria-hidden className={ROW_ICON}>
          <ChevronDownIcon
            className={cn("size-5 transition-transform", open && "rotate-180")}
          />
        </span>
      </button>
      {open && (
        <div className="border-t">
          <div className="px-6 py-4">
            <PillChoice
              testId="answer-filter"
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: t("filters.all") },
                { value: "correct", label: t("filters.correct") },
                { value: "wrong", label: t("filters.wrong") },
              ]}
            />
          </div>
          {shown.length > 0 ? (
            <ul className="divide-y border-t">
              {shown.map((item) => (
                <li key={item.question_id}>{renderItem(item)}</li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              {questions("noMatches")}
            </p>
          )}
        </div>
      )}
    </li>
  )
}
