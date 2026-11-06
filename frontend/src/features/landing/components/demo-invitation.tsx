"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"

import { SummaryCards } from "@/components/common/summary-cards"
import { DemoLogo } from "@/features/landing/components/demo-logo"
import {
  DEMO_COMPANY,
  DEMO_QUESTION_SECONDS,
  DEMO_TOTAL_MINUTES,
} from "@/config/candidates-demo"
import { useDemoContent } from "@/features/landing/hooks/use-demo-content"
import { bdi } from "@/lib/bidi"

// The real page's rules, shortened, in its groups (`invite.groups`); by voice, its rule comes last
// in the first group. Phones show the first group only.
const GROUPS = {
  how: ["pick", "change", "unanswered"],
  time: ["time", "saved", "extraTime"],
  rights: ["people", "stay"],
} as const

/** A candidate's start page, small, for the landing: the company's logo and who invited them,
 * the interview's title and times, its start (`action`), and the rules on a gray area beside them
 * (across the frame on phones, before the start). */
export function DemoInvitation({
  voice,
  action,
}: {
  // Taken by voice: its rule first, as on the real page.
  voice: boolean
  // The start: the pledge, the start button and, by voice, the microphone's step first.
  action: React.ReactNode
}) {
  const t = useTranslations("invite")
  const rules = useTranslations("landing.candidates.rules")
  const { title } = useDemoContent("candidates")
  let number = 0

  return (
    <div className="grid flex-1 gap-6 text-center md:grid-cols-[5fr_6fr] md:gap-8">
      <div className="self-center max-md:contents md:space-y-5">
        <div className="space-y-6 md:pb-2.5">
          <div className="flex flex-col items-center gap-3">
            <DemoLogo className="size-20" />
            <p className="text-sm text-muted-foreground">
              {t.rich("invitedYou", {
                company: DEMO_COMPANY,
                ...bdi,
                b: (chunks) => (
                  <span className="font-medium text-foreground">{chunks}</span>
                ),
              })}
            </p>
          </div>
          <p
            data-demo-target="title"
            className="font-heading text-2xl leading-tight font-medium tracking-tight text-balance"
          >
            {title}
          </p>
        </div>
        <SummaryCards
          className="text-start sm:grid-cols-2!"
          rows={[
            {
              id: "time-per-question",
              label: t("timePerQuestion"),
              value: `${DEMO_QUESTION_SECONDS} ${t("secondsUnit")}`,
            },
            {
              id: "total-minutes",
              label: t("wholeInterview"),
              value: `${DEMO_TOTAL_MINUTES} ${t("minutesUnit")}`,
            },
          ]}
        />
        <div className="max-md:order-last">{action}</div>
      </div>
      {/* The rules by what they're about, numbered on through them in the brand colour, on a gray
          area as on the real page: out to the frame's edges, the full height of its end side from
          tablets up; across it on phones. */}
      <div className="-mx-5 flex flex-col justify-center gap-5 bg-surface px-5 py-6 text-start text-sm text-muted-foreground sm:-mx-8 sm:px-8 md:-my-8 md:ms-0 md:rounded-e-[calc(var(--radius-xl)-1px)] md:py-8">
        {Object.entries(GROUPS).map(([group, keys], place) => (
          <div
            key={group}
            className={cn("space-y-2", place > 0 && "max-md:hidden")}
          >
            <p className="font-heading text-base font-medium text-foreground">
              {t(`groups.${group as keyof typeof GROUPS}`)}
            </p>
            <ol className="space-y-2">
              {[
                ...keys
                  .slice(0, group === "how" && voice ? 2 : undefined)
                  .map((rule) =>
                    rules.rich(rule, { company: DEMO_COMPANY, ...bdi })
                  ),
                ...(group === "how" && voice
                  ? [t("voice"), rules.rich("unanswered")]
                  : []),
              ].map((rule, index) => {
                number += 1

                return (
                  <li key={index} className="flex items-baseline gap-3">
                    <span className="w-5 shrink-0 text-base font-medium text-primary tabular-nums">
                      {number}.
                    </span>
                    <span>{rule}</span>
                  </li>
                )
              })}
            </ol>
          </div>
        ))}
      </div>
    </div>
  )
}
