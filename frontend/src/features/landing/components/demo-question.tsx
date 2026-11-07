"use client"

import { cn } from "cn"
import { CornerRightDownIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { ChoiceOptions } from "@/features/company/components/choice-options"
import { CodeEditor } from "@/components/common/code-editor"
import { MultiChoiceTag } from "@/components/common/multi-choice-tag"
import { AI_GENERATED } from "@/config/ai-generated"
import { CARD_PADDING } from "@/config/cards"
import type { DemoQuestion } from "@/config/candidates-demo"
import type { CodeToken } from "@/lib/code-tokens"

// Nothing happens on a tap: the pointer plays the picks.
const NO_TAP = () => {}

// As its screen comes in: the question pops in, then its options fly in one after another from
// the start side (promo-pop, promo-fly-in: promo.css); a picked option jumps as it's clicked
// (promo-click.css). Only with motion allowed.
const POP =
  "motion-safe:animate-[promo-pop_0.5s_cubic-bezier(0.2,0.9,0.3,1.2)_both]"
const QUESTION_APPEAR = `${POP} [animation-delay:250ms]`
const OPTIONS_APPEAR =
  "motion-safe:[&_li]:animate-[promo-fly-in_0.5s_cubic-bezier(0.2,0.9,0.3,1.2)_both] rtl:[&_li]:[--fly-from:1] [&_li]:[animation-delay:400ms] [&_li:nth-child(2)]:[animation-delay:500ms] [&_li:nth-child(3)]:[animation-delay:600ms] [&_li:nth-child(4)]:[animation-delay:700ms]"

/** A question and its options as a candidate plays it (features/company/components/
 * session-play.tsx), for the landing: the grey card, with the multi-answer tag on a multi-answer
 * question; its example under it in the editor's look (`exampleColors`); the hint to pick several
 * and the real option cards, the `picked` ones marked. The options are the pointer's. While it
 * `appear`s (its screen shown), the question pops in, the options fly in and a picked option
 * bumps. */
export function DemoQuestionCard({
  question,
  picked,
  exampleColors = null,
  appear,
  className,
}: {
  question: DemoQuestion
  picked: number[]
  exampleColors?: CodeToken[][] | null
  appear: boolean
  className?: string
}) {
  const t = useTranslations("session")

  return (
    <div className={cn("grid grid-cols-[minmax(0,1fr)] gap-5", className)}>
      <div className={cn("space-y-3", appear && QUESTION_APPEAR)}>
        <div className={cn("space-y-3 rounded-xl bg-surface", CARD_PADDING)}>
          {question.multi && <MultiChoiceTag />}
          <p {...AI_GENERATED} className="text-xl leading-snug font-normal">
            {question.text}
          </p>
        </div>
        {question.example && (
          <CodeEditor
            code={question.example.code}
            language={question.example.language}
            tokens={[exampleColors]}
            header={false}
            className="[&_pre]:py-2.5 [&_pre]:text-xs [&_pre]:leading-normal"
          />
        )}
      </div>
      <div className="space-y-4">
        {question.multi && (
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {t("selectAll")}
            <CornerRightDownIcon className="size-4 text-primary rtl:-scale-x-100" />
          </p>
        )}
        <div
          data-demo-target="options"
          className={cn(
            "[&_button]:py-2.5 [&_button]:text-base",
            appear && OPTIONS_APPEAR
          )}
        >
          <ChoiceOptions
            options={question.options}
            chosen={picked}
            multi={question.multi}
            disabled={false}
            onChoose={NO_TAP}
          />
        </div>
      </div>
    </div>
  )
}
