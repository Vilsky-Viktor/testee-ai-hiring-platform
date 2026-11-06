import { useTranslations } from "next-intl"

import { ShortNumber } from "@/components/common/short-number"
import { SummaryCards } from "@/components/common/summary-cards"

/** What the interview adds up to for each candidate, as the API counts it: every question they
 * get (against `maxQuestions`, the most the API allows), the time each has, and the whole
 * interview's time. */
export function InterviewEstimate({
  questions,
  maxQuestions,
  questionSeconds,
  minutes,
}: {
  questions: number
  maxQuestions: number
  questionSeconds: number
  minutes: number
}) {
  const t = useTranslations("interviews")
  const tInvite = useTranslations("invite")
  const tQuestions = useTranslations("questions")

  return (
    <SummaryCards
      testId="interview-estimate"
      className="max-sm:*:last:col-span-2"
      rows={[
        {
          id: "total-questions",
          label: t("totalQuestions"),
          value: (
            <>
              <ShortNumber value={questions} />{" "}
              {tQuestions("ofCount", { count: maxQuestions })}
            </>
          ),
        },
        {
          id: "question-seconds",
          label: tInvite("timePerQuestion"),
          value: (
            <>
              <ShortNumber value={questionSeconds} /> {tInvite("secondsUnit")}
            </>
          ),
        },
        {
          id: "total-minutes",
          label: tInvite("wholeInterview"),
          value: (
            <>
              <ShortNumber value={minutes} /> {tInvite("minutesUnit")}
            </>
          ),
        },
      ]}
    />
  )
}
