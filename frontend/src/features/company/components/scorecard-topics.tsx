"use client"

import { ScorecardItem } from "@/components/common/scorecard-review"
import { TopicDisclosure } from "@/components/common/topic-disclosure"
import { LIST_BOX } from "@/config/lists"
import { IntegrityLine } from "@/features/company/components/integrity-line"
import type { Scorecard } from "@/types/company"

/** A candidate's topics, each with its grade and signals, opening to its questions. */
export function ScorecardTopics({
  sessions,
  language,
}: {
  sessions: Scorecard["sessions"]
  language: string
}) {
  return (
    <ul
      className={`${LIST_BOX} overflow-hidden`}
      data-testid="candidate-topics"
    >
      {sessions.map((session) => (
        <TopicDisclosure
          key={session.id}
          title={session.topic_title}
          language={language}
          score={session.final_score}
          passed={session.passed}
          meta={<IntegrityLine session={session} />}
          items={session.review}
          renderItem={(item) => (
            <ScorecardItem item={item} language={language} />
          )}
        />
      ))}
    </ul>
  )
}
