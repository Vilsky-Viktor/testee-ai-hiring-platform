"use client"

import { cn } from "cn"
import { useState } from "react"

import { AnswerOptions } from "@/components/common/answer-options"
import { QuestionFeedback } from "@/components/common/question-feedback"
import { QuestionFixes } from "@/components/common/question-fixes"
import { QuestionInclude } from "@/components/common/question-include"
import { QuestionReportsPanel } from "@/components/common/question-reports-panel"
import { MultiChoiceTag } from "@/components/common/multi-choice-tag"
import { QuestionText } from "@/components/common/question-text"
import { languageOf } from "@/lib/locale"
import type { QuestionStats } from "@/types/feedback"

export function QuestionRow({
  question,
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
  const [showReports, setShowReports] = useState(false)

  const choosable = question.excluded !== undefined
  const out = Boolean(question.excluded)

  return (
    // Columns: the checkbox (an interview's questions), the question, then feedback and actions;
    // on phones one under another, the checkbox and the feedback centered. Reports open in a row
    // below.
    <div
      data-testid="question-row"
      className={cn(
        "grid max-sm:grid-cols-1",
        choosable ? "grid-cols-[auto_1fr_auto]" : "grid-cols-[1fr_auto]"
      )}
    >
      {choosable && (
        <div className="flex items-start ps-5 pt-5 max-sm:justify-center max-sm:ps-0 max-sm:pt-7">
          <QuestionInclude
            question={question}
            excludePath={excludePath}
            onChange={onChange}
          />
        </div>
      )}
      <div
        className={cn(
          "min-w-0 px-5 py-5 font-light max-sm:pt-7",
          (regenerating || out) && "opacity-50"
        )}
      >
        <div {...languageOf(language)}>
          <QuestionText text={question.text} />
        </div>
        {/* Candidates tick every right option of it. */}
        {question.multi && (
          <div className="mt-3">
            <MultiChoiceTag />
          </div>
        )}
        <div {...languageOf(language)}>
          <AnswerOptions options={question.options} className="mt-3" />
        </div>
      </div>
      <div className="self-center py-5 ps-5 pe-6 text-sm whitespace-nowrap text-muted-foreground tabular-nums max-sm:px-5 max-sm:pt-0 max-sm:pb-7">
        <span className="flex flex-col items-end gap-3 max-sm:items-center">
          <QuestionFeedback
            question={question}
            ratingPath={
              feedbackPath ? `${feedbackPath}/${question.id}/rating` : undefined
            }
            showReports={showReports}
            onToggleReports={
              reportsPath ? () => setShowReports((shown) => !shown) : undefined
            }
            onChange={onChange}
          />
          <QuestionFixes
            questionId={question.id}
            canRegenerate={canRegenerate}
            wrongPath={wrongPath}
            regenerating={regenerating}
            busy={busy}
            onRegenerate={onRegenerate}
          />
        </span>
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
