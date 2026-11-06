"use client"

import { cn } from "cn"
import { useMemo, useState } from "react"

import { CreateDescribe } from "@/features/landing/components/create-describe"
import { CreateEmail } from "@/features/landing/components/create-email"
import { CreateReady } from "@/features/landing/components/create-ready"
import { CreateTopics } from "@/features/landing/components/create-topics"
import { DemoPanel } from "@/features/landing/components/demo-panel"
import { DemoPointer } from "@/features/landing/components/demo-pointer"
import { PromoBurst } from "@/features/landing/components/promo-burst"
import {
  INBOX,
  READY,
  STEPS,
  TARGETS,
  TOPICS,
  WRITING,
  createSteps,
} from "@/config/create-demo-steps"
import { useDemoContent } from "@/features/landing/hooks/use-demo-content"
import { useSpotlight } from "@/features/landing/hooks/use-spotlight"
import { useClickBump } from "@/features/landing/hooks/use-click-bump"
import { pointedAt, useDemoSteps } from "@/hooks/use-demo-steps"

/** How an interview is created, played in one frame, each screen taking the last one's place: a
 * job description pasted into the home page's box and sent, and a first company named; the
 * topics it gives, adjusted by hand and by asking the AI, then approved; their questions written,
 * then the interview ready, its questions per candidate changed and a candidate invited; last,
 * the candidate's inbox, the invitation opened and its button clicked. A
 * numbered pill on the frame's top edge names the stage. The frame keeps one size as it plays.
 * Played as a promo that stays readable: the frame holds still, never magnifying; whatever is
 * clicked bumps as the click lands; a field's background lights up before it's typed in (FIELDS)
 * and a button glows softly as the pointer heads for it; each screen shows only what its step is
 * about, its parts sliding up one after another; dialogs and the "sent" notice fly up, menus
 * unfold, topics fly in, the email drops in, the focal element floats, screens rise into place,
 * and a burst marks the interview ready and the candidate invited (`data-promo`,
 * `data-create-promo`: promo.css, promo-create.css). With reduced motion, none of it moves. */
// The fields typed in: each lights up from when the pointer heads for it.
const FIELDS = new Set([
  "name",
  "edit",
  "subtopic",
  "ask",
  "seconds",
  "email",
  "inviteName",
])

export function CreateFlow({
  labels,
}: {
  labels: {
    // Each stage's title, its number first.
    steps: React.ReactNode[]
    status: string
  }
}) {
  const content = useDemoContent("create")
  // The texts typed, in the page's language, decide how long their steps last.
  const steps = useMemo(() => createSteps(content), [content])
  const { ref, ...at } = useDemoSteps<HTMLDivElement>(steps)
  const stage =
    at.index < TOPICS ? 0 : at.index < WRITING ? 1 : at.index < INBOX ? 2 : 3
  // What the pointer moves to: the element named so in the screen shown, found as the pointer
  // looks for it. Made once, so the pointer only moves when its target does.
  const [targets] = useState(() =>
    Object.fromEntries(
      TARGETS.map((name) => [
        name,
        {
          get current() {
            return (
              ref.current?.querySelector<HTMLElement>(
                `[data-shown=true] [data-demo-target="${name}"]`
              ) ?? null
            )
          },
        },
      ])
    )
  )
  const point = pointedAt(STEPS, at.index)
  const step = STEPS[at.index].name

  // The field about to be typed in, lit until the pointer moves on.
  useSpotlight(FIELDS.has(point ?? "") ? targets[point!] : null, at.index)
  // What the pointer clicks bumps as the click lands, as a picked answer does.
  useClickBump(
    targets[point ?? ""] ?? null,
    STEPS[at.index].click === true,
    at.index
  )

  // A screen, shown while it's the stage's: it rises into place from a little smaller and out of
  // focus, as the one before lifts away, growing and fading.
  function screen(number: number, content: React.ReactNode) {
    return (
      <div
        data-shown={stage === number}
        className={cn(
          "relative flex min-h-0 flex-col overflow-hidden p-5 transition-[opacity,translate,scale,filter,visibility] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:filter-none sm:p-8",
          stage === number
            ? "delay-200 duration-700"
            : cn(
                "invisible opacity-0 blur-sm duration-300",
                number > stage
                  ? "translate-y-8 scale-95"
                  : "-translate-y-6 scale-105"
              )
        )}
      >
        {content}
      </div>
    )
  }

  return (
    // The stage's title is a bubble moulded into the frame's top edge (styles/field-pill.css), so it
    // never moves the frame; the titles lie on top of each other, crossfading, as wide as the widest.
    <div data-promo data-create-promo className="relative">
      <div className="absolute start-1/2 top-0 z-20 grid -translate-x-1/2 -translate-y-1/2 *:[grid-area:1/1] rtl:translate-x-1/2">
        <span
          aria-hidden
          className="field-pill field-pill-line relative [--bubble:27px]"
        />
        {labels.steps.map((title, index) => (
          <p
            key={index}
            data-testid="create-step"
            data-current={index === stage}
            className={cn(
              "relative overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--input)_10%,var(--background))] py-3.25 ps-18 pe-6.25 text-center font-heading text-lg font-medium whitespace-nowrap lowercase transition-opacity duration-300 sm:text-xl",
              index !== stage && "opacity-0"
            )}
          >
            {title}
          </p>
        ))}
      </div>
      <DemoPanel ref={ref} className="border-transparent">
        <div className="relative -m-3 flex flex-1 flex-col overflow-hidden rounded-[inherit]">
          <div className="relative flex flex-1 flex-col">
            <DemoPointer
              target={targets[point ?? ""] ?? null}
              clicking={STEPS[at.index].click === true}
              click={at.index}
            />
            {/* One size for every screen, so nothing moves as they change. */}
            <div className="grid h-[46.5rem] grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] *:min-w-0 *:[grid-area:1/1] max-sm:h-[42.5rem] lg:h-[40.5rem]">
              {screen(0, <CreateDescribe at={at} />)}
              {screen(
                1,
                <div className="mx-auto flex w-full max-w-3xl min-w-0 flex-1">
                  <CreateTopics at={at} />
                </div>
              )}
              {screen(
                2,
                <CreateReady at={at} labels={{ status: labels.status }} />
              )}
              {screen(3, <CreateEmail at={at} />)}
            </div>
          </div>
          {/* The interview ready, and the candidate invited. */}
          {(at.index === READY || step === "invited") && (
            <PromoBurst key={step} />
          )}
        </div>
      </DemoPanel>
    </div>
  )
}
