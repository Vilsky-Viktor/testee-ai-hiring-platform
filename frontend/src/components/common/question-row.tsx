"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { AnswerOptions } from "@/components/common/answer-options"
import { QuestionFeedback } from "@/components/common/question-feedback"
import { QuestionFixes } from "@/components/common/question-fixes"
import { QuestionInclude } from "@/components/common/question-include"
import { QuestionReportsPanel } from "@/components/common/question-reports-panel"
import { MultiChoiceTag } from "@/components/common/multi-choice-tag"
import { QuestionText } from "@/components/common/question-text"
import { Badge } from "@/components/ui/badge"
import { ROW_HOVER } from "@/config/lists"
import { languageOf } from "@/lib/locale"
import type { QuestionStats } from "@/types/feedback"

export function QuestionRow({
  question,
  number,
  language,
  canRegenerate,
  wrongPath,
  reportsPath,
  feedbackPath,
  excludePath,
  regenerating,
  busy,
  onRegenerate,
  onChange,
}: {
  question: QuestionStats
  // Where it is in the topic, whatever the filter.
  number: number
  // What the question is written in; its text and options carry it.
  language: string
  canRegenerate: boolean
  // Where to say the marked answer is wrong (owners and admins, superadmins).
  wrongPath?: string
  reportsPath?: string
  // A member's own like, dislike and report on an interview's question.
  feedbackPath?: string
  // Where an owner or admin leaves a question out of the interview, or brings it back; without
  // it the checkbox only shows whether it's in.
  excludePath?: string
  regenerating: boolean
  busy: boolean
  onRegenerate: () => void
  onChange: (question: QuestionStats) => void
}) {
  const t = useTranslations("questions")
  const [showReports, setShowReports] = useState(false)

  const choosable = question.excluded !== undefined

  return (
    // Columns: its number and checkbox (an interview's questions), the question with its
    // feedback under it, then the menu. Reports open in a row below.
    <div data-testid="question-row" className={`group/row ${ROW_HOVER}`}>
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-4 p-6 max-sm:px-4">
        <div className="flex flex-col items-center gap-3">
          <span
            data-testid="question-number"
            className="flex size-6 items-center justify-center font-heading text-sm text-muted-foreground tabular-nums"
          >
            {number}
          </span>
          {choosable && (
            <QuestionInclude
              question={question}
              excludePath={excludePath}
              onChange={onChange}
            />
          )}
        </div>
        <div className={cn("min-w-0 space-y-3", regenerating && "opacity-50")}>
          {question.excluded && (
            <Badge variant="outline" data-testid="question-disabled">
              {t("disabled")}
            </Badge>
          )}
          <div {...languageOf(language)} className="font-light">
            <QuestionText text={question.text} />
          </div>
          {/* Candidates tick every right option of it. */}
          {question.multi && <MultiChoiceTag />}
          <div {...languageOf(language)} className="font-light">
            <AnswerOptions options={question.options} />
          </div>
          <div className="pt-1 text-sm text-muted-foreground tabular-nums">
            <QuestionFeedback
              question={question}
              ratingPath={
                feedbackPath
                  ? `${feedbackPath}/${question.id}/rating`
                  : undefined
              }
              showReports={showReports}
              onToggleReports={
                reportsPath
                  ? () => setShowReports((shown) => !shown)
                  : undefined
              }
              onChange={onChange}
            />
          </div>
        </div>
        <QuestionFixes
          questionId={question.id}
          canRegenerate={canRegenerate}
          wrongPath={wrongPath}
          regenerating={regenerating}
          busy={busy}
          onRegenerate={onRegenerate}
        />
      </div>
      {reportsPath && showReports && (
        <QuestionReportsPanel
          question={question}
          reportsPath={reportsPath}
          feedbackPath={feedbackPath}
          onChange={onChange}
        />
      )}
    </div>
  )
}
