"use client"

import { ScorecardMark } from "@/components/common/scorecard-review"
import { AnswerOptions } from "@/components/common/answer-options"
import { AnswerPoints } from "@/components/common/answer-points"
import { QuestionActions } from "@/components/common/question-actions"
import { MultiChoiceTag } from "@/components/common/multi-choice-tag"
import { QuestionText } from "@/components/common/question-text"
import { TopicDisclosure } from "@/components/common/topic-disclosure"
import { languageOf } from "@/lib/locale"
import type { PracticeRound, ReviewItem } from "@/types/round"
import { LIST_BOX } from "@/config/lists"

/** A finished practice round's topics, each with its grade, opening to its questions laid out
 * like a scorecard. `language` is the questions' own, which can differ from the page's. */
export function PracticeTopics({
  topics,
  language,
}: {
  topics: PracticeRound["topics"]
  language: string | null | undefined
}) {
  return (
    <ul className={`${LIST_BOX} overflow-hidden`} data-testid="practice-topics">
      {topics.map((topic) => (
        <TopicDisclosure
          key={topic.session_id}
          title={topic.title}
          language={language}
          score={topic.score}
          items={topic.review}
          renderItem={(item) => (
            <PracticeItem
              item={item}
              sessionId={topic.session_id}
              language={language}
            />
          )}
        />
      ))}
    </ul>
  )
}

/** A question of a finished round: right or wrong, every option with the right one marked, and
 * the talent's own pick. Under it, the talent rates or reports it, as candidates do in a test; a
 * reported wrong answer gets the question checked and fixed. `sessionId` is the topic's section. */
function PracticeItem({
  item,
  sessionId,
  language,
}: {
  item: ReviewItem
  sessionId: string
  language: string | null | undefined
}) {
  return (
    <div className="space-y-4 p-6 max-sm:py-8">
      {/* On phones whether it was right sits above the question, centered. */}
      <div className="flex items-start justify-between gap-8 max-sm:flex-col-reverse max-sm:items-center max-sm:gap-4">
        {/* A multi-answer question tagged as while it was played. */}
        <div
          className="min-w-0 space-y-3 max-sm:self-stretch"
          {...languageOf(language)}
        >
          {item.multi && <MultiChoiceTag />}
          <QuestionText text={item.text} className="text-lg font-light" />
        </div>
        <ScorecardMark item={item} />
      </div>
      <div {...languageOf(language)}>
        <AnswerOptions
          options={item.options.map((answer, index) => ({
            answer,
            correct: Boolean(item.correct_indexes?.includes(index)),
          }))}
          // None when unanswered or timed out: still a practice report.
          picked={item.answer?.picks ?? []}
          className="text-base"
        />
      </div>
      <AnswerPoints item={item} />
      <div className="max-sm:pt-4">
        <QuestionActions
          basePath={`/rounds/sessions/${sessionId}/questions/${item.question_id}`}
        />
      </div>
    </div>
  )
}
