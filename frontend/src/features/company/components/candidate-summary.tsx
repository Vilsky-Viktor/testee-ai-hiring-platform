import { CheckIcon } from "lucide-react"
import { cn } from "cn"
import { getLocale, getTranslations } from "next-intl/server"

import { PassStatus } from "@/components/common/pass-status"
import { ShortNumber } from "@/components/common/short-number"
import { SummaryCards } from "@/components/common/summary-cards"
import { InfoCard } from "@/components/common/warning-card"
import { WARNING_TONE } from "@/config/tones"
import { formatPercent } from "@/lib/format"
import { gradeTone } from "@/lib/grade-tone"
import type { Scorecard } from "@/types/company"

/** A started candidate's result at a glance, and that they confirmed answering on their own; then
 * that the score supports a decision people make, in the gray info card, like the practice test
 * page's (on phones it spans the screen, with square corners). Signals are the browser's report:
 * said so wherever they show. */
export async function CandidateSummary({ card }: { card: Scorecard }) {
  const t = await getTranslations("candidates")
  const invite = await getTranslations("invite")
  const reportT = await getTranslations("report")
  const locale = await getLocale()
  const signals = card.sessions.reduce(
    (sum, item) => sum + item.tab_leaves + item.copies + item.fast_answers,
    0
  )

  return (
    <>
      <SummaryCards
        testId="candidate-result"
        className="lg:grid-cols-4"
        rows={[
          {
            id: "grade",
            label: t("grade"),
            value: (
              <span className={cn(gradeTone(card.passed))}>
                {card.grade == null ? "–" : formatPercent(card.grade, locale)}
              </span>
            ),
          },
          {
            id: "result",
            label: t("summary.result"),
            value: (
              <PassStatus passed={card.passed} passMark={card.pass_mark} />
            ),
          },
          {
            id: "time-taken",
            label: t("summary.timeTaken"),
            value:
              card.time_taken_minutes == null
                ? "–"
                : `${card.time_taken_minutes} ${invite("minutesUnit")}`,
          },
          {
            id: "signals",
            label: t("summary.signals"),
            value: (
              <span className={cn(signals > 0 && WARNING_TONE)}>
                <ShortNumber value={signals} />
              </span>
            ),
          },
        ]}
      />
      {card.pledged_at && (
        <p
          data-testid="pledged"
          className="flex items-center gap-1.5 text-sm text-muted-foreground"
        >
          <CheckIcon aria-hidden className="size-4 shrink-0" />
          {reportT("pledged")}
        </p>
      )}
      <div data-testid="human-review" className="max-sm:-mx-6">
        <InfoCard className="text-sm max-sm:rounded-none">
          {signals ? reportT("humanReviewSignals") : reportT("humanReview")}
        </InfoCard>
      </div>
    </>
  )
}
