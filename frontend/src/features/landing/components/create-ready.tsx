"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"

import { DemoInterview } from "@/features/landing/components/demo-interview"
import { DemoInvitePopup } from "@/features/landing/components/demo-invite-popup"
import { DemoSentNotice } from "@/features/landing/components/demo-popup"
import { DemoGeneration } from "@/features/landing/components/demo-generation"
import {
  DEMO_INTERVIEW,
  DEMO_INVITE_EMAIL,
  DEMO_INVITE_NAME,
  DEMO_LIMITS,
  DEMO_QUESTION_SECONDS,
} from "@/config/create-demo"
import {
  INVITING,
  READY,
  SECONDS_TYPED,
  SETTINGS_CLOSED,
  SETTINGS_OPEN,
  STEPS,
  WRITTEN,
  adjusted,
} from "@/config/create-demo-steps"
import { useDemoContent } from "@/features/landing/hooks/use-demo-content"
import { countedAt, stepIndex } from "@/hooks/use-demo-steps"
import { bdi } from "@/lib/bidi"

/** How many questions each candidate gets of each of `names` (the topics) at step `index`: the
 * interview's default, then each of DEMO_LIMITS once its step (`limit<n>`) is reached. */
function limitsAt(index: number, names: string[]) {
  const limits: Record<string, number> = Object.fromEntries(
    names.map((name) => [name, DEMO_INTERVIEW.perCandidate])
  )

  DEMO_LIMITS.forEach(({ topic, limit }, position) => {
    if (index >= stepIndex(STEPS, `limit${position}`)) {
      limits[names[topic]] = limit
    }
  })

  return limits
}

// The steps that show a topic's number just saved, by its place among the changed ones.
const SAVED_AT: Record<string, number> = {
  aimLimit1: 0,
  focusLimit1: 0,
  aimSettings: 1,
}

/** The create demo's last screen at step `at`: the generation page while the questions are
 * written, then the interview
 * in their place; the questions per candidate changed on two topics, the time per question set
 * in its settings tab, then a candidate invited
 * from the invite dialog, and the "sent" notice. */
export function CreateReady({
  at,
  labels,
}: {
  at: { index: number; n: number }
  labels: { status: string }
}) {
  const share = useTranslations("share")
  const topics = adjusted(useDemoContent("create"))
  const names = topics.map(({ name }) => name)
  // The topics whose questions per candidate are changed, in turn.
  const changed = DEMO_LIMITS.map(({ topic }) => names[topic])
  const step = STEPS[at.index].name
  const emailed = countedAt(STEPS, at, "typingEmail", DEMO_INVITE_EMAIL.length)
  const named = countedAt(STEPS, at, "typingName", DEMO_INVITE_NAME.length)
  // The time per question: the interview's own until it's typed over, as typed so far.
  const seconds =
    at.index < SECONDS_TYPED
      ? String(DEMO_INTERVIEW.questionSeconds)
      : DEMO_QUESTION_SECONDS.slice(
          0,
          countedAt(STEPS, at, "typingSeconds", DEMO_QUESTION_SECONDS.length)
        )
  // The topic whose number is being changed: from its click until the next step moves on.
  const focused =
    changed.find((_, position) =>
      [`focusLimit${position}`, `limit${position}`].includes(step)
    ) ?? null

  return (
    <>
      {/* One frame high: the generation page while the questions are written; then the
          interview, cut off at its bottom. */}
      <div className="relative grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] p-2 *:[grid-area:1/1]">
        <div
          data-testid="demo-writing"
          className={cn(
            "flex min-h-0 min-w-0",
            at.index >= READY && "invisible opacity-0"
          )}
        >
          <DemoGeneration
            topics={names}
            ready={countedAt(STEPS, at, "writing", WRITTEN)}
          />
        </div>
        <div
          data-testid="demo-interview"
          // Closed until ready, so its parts slide in as it shows (promo-create.css).
          data-open={at.index >= READY}
          // Its own layer, so its raised icons stay under the dialog.
          className={cn(
            "isolate flex min-h-0 min-w-0",
            at.index < READY && "invisible opacity-0"
          )}
        >
          <DemoInterview
            topics={topics}
            status={labels.status}
            limits={limitsAt(at.index, names)}
            changed={changed}
            focused={focused}
            savedTopic={
              SAVED_AT[step] === undefined ? null : changed[SAVED_AT[step]]
            }
            pressed={step === "invite"}
            backPressed={step === "back"}
            tab={
              at.index >= SETTINGS_OPEN && at.index < SETTINGS_CLOSED
                ? "settings"
                : "topics"
            }
            seconds={seconds}
            typingSeconds={step === "focusSeconds" || step === "typingSeconds"}
            secondsSaved={step === "secondsSet"}
          />
        </div>
      </div>
      <DemoInvitePopup
        open={INVITING.includes(step)}
        email={DEMO_INVITE_EMAIL.slice(0, emailed)}
        typing={step === "focusEmail" || step === "typingEmail"}
        name={DEMO_INVITE_NAME.slice(0, named)}
        naming={step === "focusInviteName" || step === "typingName"}
        pressed={step === "sendInvite"}
      />
      <DemoSentNotice
        shown={step === "invited"}
        text={share.rich("sent", { email: DEMO_INVITE_EMAIL, ...bdi })}
      />
    </>
  )
}
