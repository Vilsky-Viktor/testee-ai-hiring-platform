"use client"

import { cn } from "cn"
import { useRef, useState } from "react"

import { CreateDescribe } from "@/features/landing/components/create-describe"
import { CreateReady } from "@/features/landing/components/create-ready"
import { CreateTopics } from "@/features/landing/components/create-topics"
import { DemoPanel } from "@/features/landing/components/demo-panel"
import { DemoPointer } from "@/features/landing/components/demo-pointer"
import { PromoBurst } from "@/features/landing/components/promo-burst"
import {
  READY,
  STEPS,
  TARGETS,
  TOPICS,
  WRITING,
} from "@/config/create-demo-steps"
import { useDemoCamera } from "@/hooks/use-demo-camera"
import { pointedAt, useDemoSteps } from "@/hooks/use-demo-steps"

/** How an interview is created, played in one frame, each screen taking the last one's place: a
 * job description pasted into the home page's box and sent, and a first company named; the
 * topics it gives, adjusted by hand and by asking the AI, then approved; their questions written,
 * then the interview ready, its questions per candidate changed and a candidate invited. A
 * numbered pill on the frame's top edge names the stage. The frame keeps one size as it plays.
 * Played as a promo: a camera zooms towards where the pointer works, screens slide in with
 * depth, and a burst marks the interview ready and the candidate invited; the effects scoped to
 * it (`data-promo`, animations.css). With reduced motion, none of it moves. */
export function CreateFlow({
  labels,
}: {
  labels: {
    // Each stage's title, its number first.
    steps: React.ReactNode[]
    status: string
  }
}) {
  const { ref, ...at } = useDemoSteps<HTMLDivElement>(STEPS)
  const stage = at.index < TOPICS ? 0 : at.index < WRITING ? 1 : 2
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
  const camera = useRef<HTMLDivElement>(null)
  const view = useDemoCamera(camera, targets[point ?? ""] ?? null, at.index)
  const step = STEPS[at.index].name

  // A screen, shown while it's the stage's: it slides in from the end, out of focus and a
  // little smaller, as the one before leaves towards the start.
  function screen(number: number, content: React.ReactNode) {
    return (
      <div
        data-shown={stage === number}
        className={cn(
          "relative flex min-h-0 flex-col overflow-hidden transition-[opacity,translate,scale,filter,visibility] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:filter-none",
          stage === number
            ? "delay-200 duration-700"
            : cn(
                "invisible scale-95 opacity-0 blur-sm duration-300",
                number > stage
                  ? "translate-x-[8%] rtl:-translate-x-[8%]"
                  : "-translate-x-[8%] rtl:translate-x-[8%]"
              )
        )}
      >
        {content}
      </div>
    )
  }

  return (
    // The stage's title sits on the frame's top edge, a third of it over it, so it never moves
    // the frame; the titles lie on top of each other, crossfading, as wide as the widest.
    <div data-promo className="relative">
      <div className="absolute start-1/2 top-0 z-20 grid -translate-x-1/2 -translate-y-2/3 *:[grid-area:1/1] rtl:translate-x-1/2">
        {labels.steps.map((title, index) => (
          <p
            key={index}
            data-testid="create-step"
            data-current={index === stage}
            className={cn(
              "rounded-full border bg-background px-6 py-3 text-center font-heading text-lg font-medium whitespace-nowrap transition-opacity duration-300 sm:text-xl",
              index !== stage && "opacity-0"
            )}
          >
            {title}
          </p>
        ))}
      </div>
      <DemoPanel ref={ref}>
        {/* The camera: the screens and the pointer zoom together, cut at the frame. */}
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-lg">
          <div
            ref={camera}
            style={{
              transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            }}
            className="relative flex flex-1 flex-col transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none!"
          >
            <DemoPointer
              target={targets[point ?? ""] ?? null}
              clicking={STEPS[at.index].click === true}
              click={at.index}
            />
            {/* One size for every screen, so nothing moves as they change. */}
            <div className="grid h-[44rem] grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] p-2 *:min-w-0 *:[grid-area:1/1] max-sm:h-[40rem] sm:p-5 lg:h-[38rem]">
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
