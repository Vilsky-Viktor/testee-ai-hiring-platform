"use client"

import { cn } from "cn"
import { ArrowLeftIcon, CheckIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { DemoAnswerPatterns } from "@/features/landing/components/demo-answer-patterns"
import { PROMO_POP } from "@/features/landing/components/demo-panel"
import { DemoReportActions } from "@/features/landing/components/demo-share"
import { Dot } from "@/components/common/dot"
import { SummaryCards } from "@/components/common/summary-cards"
import { TopicDisclosure } from "@/components/common/topic-disclosure"
import { PassStatus } from "@/components/common/pass-status"
import { ScorecardItem } from "@/components/common/scorecard-review"
import { InfoCard } from "@/components/common/warning-card"
import { Badge } from "@/components/ui/badge"
import { LIST_BOX } from "@/config/lists"
import {
  DEMO_PASS_MARK,
  DEMO_TIME_TAKEN,
  type DemoCandidate,
  type DemoTopic,
} from "@/config/reports-demo"
import { WARNING_TONE } from "@/config/tones"
import { useCountUp } from "@/hooks/use-count-up"
import { useElementSize } from "@/hooks/use-element-size"
import { formatPercent } from "@/lib/format"
import { gradeTone } from "@/lib/grade-tone"
import type { ReviewItem } from "@/types/round"

// The interview's language, for its questions.
const LANGUAGE = "en"

/** A topic's question as the scorecard gives it (types/round.ts). */
function reviewItem(
  topic: DemoTopic,
  question: NonNullable<DemoTopic["question"]>
): ReviewItem {
  return {
    question_id: question.text,
    number: 1,
    text: question.text,
    options: question.options,
    multi: false,
    limit_seconds: 60,
    correct_option_index: question.right,
    answer: {
      answer_id: question.text,
      option_index: question.pick,
      picks: [question.pick],
      timed_out: false,
      correct: question.pick === question.right,
      seconds: question.seconds,
      fast: question.fast ?? false,
    },
    tab_leaves: question.tab_leaves ?? 0,
    copies: question.copies ?? 0,
  }
}

/** A candidate's page (app/companies/[companyId]/interviews/[id]/candidates/[inviteId]), for
 * the landing, scrolled down `scrolled` pixels (gliding there and back) inside the picture:
 * their name, email and status with the report's "⋮" menu (open while `menu`, share `pressed`
 * in); the result's cards and their pledge; the note that people decide; what their answers
 * show, when anything stood out; then each topic as a closed row with its signals and grade. Once `active`, its parts pop in one after another and the
 * grade counts up to the candidate's ; back at 0 when not. */
export function DemoReport({
  candidate,
  active,
  best,
  scrolled,
  menu,
  aimed,
  pressed,
  expanded,
}: {
  candidate: DemoCandidate
  active: boolean
  best: boolean
  scrolled: number
  menu: boolean
  aimed: boolean
  pressed: boolean
  // The `best` one's first topic clicked open.
  expanded: boolean
}) {
  const t = useTranslations("candidates")
  const report = useTranslations("report")
  const invite = useTranslations("invite")
  const statuses = useTranslations("candidateStatus")
  const locale = useLocale()
  const { ref: windowRef, size: windowSize } = useElementSize<HTMLDivElement>()
  const { ref: pageRef, size: pageSize } = useElementSize<HTMLDivElement>()
  const room =
    windowSize && pageSize
      ? Math.max(0, pageSize.height - windowSize.height)
      : 0
  const by = Math.min(room, scrolled)
  const signals =
    candidate.tab_leaves + candidate.copies + candidate.fast_answers
  const grade = useCountUp(active ? (candidate.grade ?? 0) : 0).shown
  // A part of the page, the `order`th to pop in.
  const pop = (order: number) => ({
    style: { animationDelay: `${250 + order * 90}ms` },
    className: cn(active && PROMO_POP),
  })

  return (
    <div ref={windowRef} className="relative min-h-0 flex-1 overflow-hidden">
      <div
        ref={pageRef}
        style={{ transform: `translateY(${-by}px)` }}
        className="absolute inset-x-0 top-0 space-y-8 transition-transform duration-2000 ease-in-out motion-reduce:transition-none"
      >
        <div
          style={pop(0).style}
          className={cn(
            // Over the cards that pop in after it, for its menu.
            "relative z-20 flex items-start justify-between gap-3",
            pop(0).className
          )}
        >
          <ArrowLeftIcon
            aria-hidden
            className="mt-1.5 size-6 shrink-0 text-muted-foreground rtl:-scale-x-100"
          />
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-heading text-3xl font-medium tracking-tight">
              {candidate.name}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-sm break-all text-muted-foreground">
                {candidate.email}
              </span>
              <Badge variant="outline" className="h-7 px-3 text-sm font-light">
                {statuses(candidate.status)}
              </Badge>
            </div>
          </div>
          <DemoReportActions
            menu={menu}
            aimed={aimed ? "share" : null}
            pressed={pressed ? "share" : null}
          />
        </div>
        <div style={pop(1).style} className={pop(1).className}>
          <SummaryCards
            className="lg:grid-cols-4"
            rows={[
              {
                id: "grade",
                label: t("grade"),
                value: (
                  <span className={gradeTone(candidate.passed)}>
                    {formatPercent(
                      candidate.grade == null ? null : grade,
                      locale
                    )}
                  </span>
                ),
              },
              {
                id: "result",
                label: t("summary.result"),
                value: (
                  <PassStatus
                    passed={candidate.passed}
                    passMark={DEMO_PASS_MARK}
                  />
                ),
              },
              {
                id: "time-taken",
                label: t("summary.timeTaken"),
                value: `${DEMO_TIME_TAKEN} ${invite("minutesUnit")}`,
              },
              {
                id: "signals",
                label: t("summary.signals"),
                value: (
                  <span className={cn(signals > 0 && WARNING_TONE)}>
                    {signals}
                  </span>
                ),
              },
            ]}
          />
        </div>
        <p
          style={pop(2).style}
          className={cn(
            "flex items-center gap-1.5 text-sm text-muted-foreground",
            pop(2).className
          )}
        >
          <CheckIcon aria-hidden className="size-4 shrink-0" />
          {report("pledged")}
        </p>
        <div {...pop(3)}>
          <InfoCard className="text-sm">
            {signals ? report("humanReviewSignals") : report("humanReview")}
          </InfoCard>
        </div>
        {candidate.patterns && (
          <div {...pop(4)}>
            <DemoAnswerPatterns patterns={candidate.patterns} />
          </div>
        )}
        <ul {...pop(5)} className={cn(LIST_BOX, pop(5).className)}>
          {candidate.topics?.map((topic, index) => (
            <DemoTopicRow
              key={topic.title}
              topic={topic}
              open={best && index === 0 && expanded}
              target={index === 0 ? "topic0" : undefined}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}

/** A topic on the page, as the real report's expandable row: its grade and bar, and its integrity
 * line under its title; `open`, with its questions as answered, right and wrong. */
function DemoTopicRow({
  topic,
  open,
  target,
}: {
  topic: DemoTopic
  open: boolean
  // The pointer's name for it.
  target?: string
}) {
  const t = useTranslations("candidates")
  const items = [topic.question, ...(topic.more ?? [])].flatMap((question) =>
    question ? [reviewItem(topic, question)] : []
  )
  const signals = [
    [t("pageLeaves", { count: topic.tab_leaves }), topic.tab_leaves],
    [t("copies", { count: topic.copies }), topic.copies],
    [t("fastAnswers", { count: topic.fast_answers }), topic.fast_answers],
  ] as const

  return (
    <TopicDisclosure
      title={topic.title}
      language={LANGUAGE}
      score={topic.grade}
      passed={topic.grade >= DEMO_PASS_MARK}
      meta={
        <span className="flex flex-wrap items-center gap-x-1.5 text-sm text-muted-foreground tabular-nums">
          {signals.map(([signal, count], index) => (
            <span key={signal} className="flex items-center gap-x-1.5">
              {index > 0 && <Dot className="mx-0" />}
              <span className={cn(count > 0 && WARNING_TONE)}>{signal}</span>
            </span>
          ))}
        </span>
      }
      items={items}
      opened={open}
      target={target}
      renderItem={(answered) => (
        <ScorecardItem item={answered} language={LANGUAGE} />
      )}
    />
  )
}
