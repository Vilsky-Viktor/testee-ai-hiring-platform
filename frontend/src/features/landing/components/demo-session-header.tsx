"use client"

import { DemoLogo } from "@/features/landing/components/demo-logo"
import { SessionHeader } from "@/features/company/components/session-header"
import {
  DEMO_QUESTION_SECONDS,
  DEMO_SECTION_QUESTIONS,
  DEMO_SECTIONS,
  type DemoQuestion,
} from "@/config/candidates-demo"
import { useStill } from "@/hooks/use-still"
import type { InterviewSession } from "@/types/company"
import type { NextQuestion } from "@/types/round"

const NOTHING = () => {}

/** The interview's real header (features/company/components/session-header.tsx), for the landing:
 * the company's logo, the question's topic and section, which question it is and the progress,
 * and its clock's ring, running while `active`, from the full time each time; with reduced motion,
 * still. */
export function DemoSessionHeader({
  question,
  active,
}: {
  question: DemoQuestion
  active: boolean
}) {
  const still = useStill()

  return (
    <SessionHeader
      brand={<DemoLogo className="size-12 max-sm:hidden" />}
      session={{ topic_title: question.topic } as InterviewSession}
      progress={{
        answered: question.answered,
        total: DEMO_SECTION_QUESTIONS,
      }}
      section={{ number: question.section, count: DEMO_SECTIONS }}
      question={
        active
          ? ({
              question_id: question.text,
              seconds: DEMO_QUESTION_SECONDS,
              seconds_left: DEMO_QUESTION_SECONDS,
            } as NextQuestion)
          : null
      }
      sending={false}
      frozen={still}
      onTimeUp={NOTHING}
    />
  )
}
