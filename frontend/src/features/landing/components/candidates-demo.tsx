"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { DemoClickSession } from "@/features/landing/components/demo-click-session"
import { DemoInvitation } from "@/features/landing/components/demo-invitation"
import { DemoMicPrompt } from "@/features/landing/components/demo-mic-prompt"
import { DemoPanel } from "@/features/landing/components/demo-panel"
import { DemoPointer } from "@/features/landing/components/demo-pointer"
import { PromoBurst } from "@/features/landing/components/promo-burst"
import { DemoStartAction } from "@/features/landing/components/demo-start-action"
import { DemoVoiceSession } from "@/features/landing/components/demo-voice-session"
import { AnswerModeSwitch } from "@/features/company/components/answer-mode-switch"
import { CLICK_QUESTIONS } from "@/config/candidates-demo"
import { useDemoContent } from "@/features/landing/hooks/use-demo-content"
import {
  type CandidateStep,
  CLICK_START,
  STEPS,
  TARGETS,
  VOICE_START,
} from "@/config/candidates-demo-steps"
import { pointedAt, stepIndex, useDemoSteps } from "@/hooks/use-demo-steps"
import { useStill } from "@/hooks/use-still"
import { useSpotlight } from "@/features/landing/hooks/use-spotlight"
import { useClickBump } from "@/features/landing/hooks/use-click-bump"
import type { VoiceAccess } from "@/hooks/use-voice-access"
import type { CodeToken } from "@/lib/code-tokens"
import type { VoiceStatus } from "@/types/round"

// Each voice-screen step's state: whose turn it is and whether the option is picked.
const VOICE: Record<string, [VoiceStatus, boolean]> = {
  vSpeaking: ["speaking", false],
  vListening: ["hearing", false],
  vThinking: ["thinking", false],
  vPicked: ["speaking", true],
  vYes: ["hearing", true],
  vMoving: ["speaking", true],
}

// The steps a burst marks: the click-mode interview finished, and the voice answer saved.
const BURSTS = ["cDone", "vMoving"]
// What lights up as the pointer heads for it: the pledge's box (never an answer).
const CHOSEN = /^pledge/

// The voice screen before it plays: Mira about to speak.
const BEFORE_VOICE: [VoiceStatus, boolean] = ["speaking", false]

/** The microphone's state on the voice start page at step `index`. */
function accessAt(index: number): VoiceAccess {
  if (index < VOICE_START) {
    return "ask"
  }

  if (index >= stepIndex(STEPS, "vGranted")) {
    return "granted"
  }

  return index >= stepIndex(STEPS, "vAllow") ? "asking" : "ask"
}

/** The place in the play of the screen `step` shows: the click-mode start page, its questions,
 * the voice start page and the voice screen, so the next rises into place and the last lifts
 * away. */
function placeOf(step: CandidateStep) {
  if (step.voice) {
    return CLICK_QUESTIONS.length + (step.screen === "start" ? 1 : 2)
  }

  return step.screen === "start" ? 0 : Number(step.screen.slice(1)) + 1
}

/** What a candidate sees, played by a pointer in one panel, in click mode and then in voice mode,
 * the switch above it showing which; a visitor can switch to either. Click mode: the start page,
 * the pledge ticked and started, a question answered by a tap and Next. Voice mode: the start
 * page, the microphone and sound allowed in the browser's prompt, started, and the voice screen:
 * Mira reads, the candidate answers, she thinks, picks it, hears a yes and moves on. The screens
 * lie on top of each other, so the panel is as tall as the tallest and never changes size.
 * Played as a promo that stays readable: the frame holds still, never magnifying; whatever is
 * clicked jumps as the click lands (promo-click.css); the pledge's box lights up before it's
 * ticked (CHOSEN); the question pops in, its options fly in one after another, the browser's
 * prompt flies up, screens rise into place, and a burst marks each mode's end (`data-promo`,
 * `data-candidates-promo`: promo-sections.css). With reduced motion, each mode's last frame,
 * none of it moving. */
export function CandidatesDemo({
  exampleColors,
}: {
  // Each click-mode question's example in its colors, made on the server.
  exampleColors: (CodeToken[][] | null)[]
}) {
  const interviews = useTranslations("interviews")
  const texts = useDemoContent("candidates").questions
  const { ref, index: playing, jumpTo } = useDemoSteps<HTMLDivElement>(STEPS)
  const still = useStill()
  // With reduced motion, the mode a visitor chose shows its last frame.
  const [stillAt, setStillAt] = useState<number | null>(null)
  const index = still && stillAt !== null ? stillAt : playing
  const step = STEPS[index]
  const after = (name: string) => index >= stepIndex(STEPS, name)
  // What the pointer moves to: found in the screen shown when the pointer looks for it.
  const [targets] = useState(() =>
    Object.fromEntries(
      Object.entries(TARGETS).map(([name, selector]) => [
        name,
        {
          get current() {
            return (
              ref.current?.querySelector<HTMLElement>(
                `[data-shown=true] ${selector}`
              ) ?? null
            )
          },
        },
      ])
    )
  )
  const point = pointedAt(STEPS, index)

  // The pledge's check box, lit while the pointer heads for it, until it's ticked (never an
  // answer: those show nothing before they're clicked).
  const aimed = step.point

  useSpotlight(CHOSEN.test(aimed ?? "") ? targets[aimed!] : null, index)
  // What the pointer clicks jumps as the click lands.
  useClickBump(targets[point ?? ""] ?? null, step.click === true, index)
  const voice = step.voice
  const shownAt = placeOf(step)

  function choose(toVoice: boolean) {
    const to = toVoice ? VOICE_START : CLICK_START

    if (still) {
      setStillAt(toVoice ? STEPS.length - 1 : VOICE_START - 1)
    } else {
      jumpTo(to)
    }
  }

  // A screen (the `place`-th), shown while it's the step's: it rises into place from a little
  // smaller and out of focus, as the one before lifts away, growing and fading.
  function screen(place: number, content: React.ReactNode, key?: string) {
    const shown = place === shownAt

    return (
      <div
        key={key}
        data-shown={shown}
        className={cn(
          "flex min-h-0 flex-col transition-[opacity,translate,scale,filter,visibility] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:filter-none",
          shown
            ? "delay-200 duration-700"
            : cn(
                "invisible opacity-0 blur-sm duration-300",
                place > shownAt
                  ? "translate-y-8 scale-95"
                  : "-translate-y-6 scale-105"
              )
        )}
      >
        {content}
      </div>
    )
  }

  const [status, voicePicked] = VOICE[step.name] ?? BEFORE_VOICE

  return (
    // The switch sits above the picture, overlapping its top edge by a third of its height, so it
    // never moves the picture.
    <div
      data-testid="candidates-demo"
      data-step={step.name}
      data-promo
      data-candidates-promo
      className="relative mx-auto w-full max-w-5xl"
    >
      {/* Outlined as the create promo's step pill is, so its grey half never blends into a
          grey screen behind it. */}
      <div className="absolute start-1/2 top-0 z-20 w-max -translate-x-1/2 -translate-y-2/3 rounded-[calc(var(--radius-xl)+1px)] border rtl:translate-x-1/2">
        <AnswerModeSwitch
          label={interviews("answerMode")}
          voice={voice}
          disabled={false}
          onChange={choose}
        />
      </div>
      <div className="w-full">
        <DemoPanel ref={ref}>
          {/* The screens, the pointer and the browser's prompt, cut at the frame's inner edge
              (the screens reach out to it). */}
          <div className="relative -m-3 flex flex-1 flex-col overflow-hidden rounded-[calc(var(--radius-xl)-1px)] max-sm:rounded-none">
            <div className="relative flex flex-1 flex-col p-3">
              <DemoPointer
                target={targets[point ?? ""] ?? null}
                clicking={step.click === true}
                click={index}
              />
              <DemoMicPrompt
                open={[
                  "vAllow",
                  "vPrompt",
                  "vAimPrompt",
                  "vPromptAllow",
                ].includes(step.name)}
                pressed={step.name === "vPromptAllow"}
              />
              {/* One fixed height for every screen of both modes, the tallest's (the voice screen
                  with Mute), so the page never moves as they change. */}
              <div className="grid h-[54rem] grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] p-2 pt-5 *:min-w-0 *:[grid-area:1/1] max-sm:h-[49rem] sm:p-5 lg:h-[38rem]">
                {screen(
                  0,
                  <DemoInvitation
                    voice={false}
                    action={
                      <DemoStartAction
                        access={null}
                        pledged={voice || after("cPledge")}
                        pressed={step.name === "cStart"}
                      />
                    }
                  />
                )}
                {CLICK_QUESTIONS.map((question, at) => {
                  const shown = step.screen === `q${at}`

                  return screen(
                    at + 1,
                    <DemoClickSession
                      question={{ ...question, ...texts[question.key] }}
                      exampleColors={exampleColors[at]}
                      active={shown}
                      // Unseen, a question keeps its picks, so it fades out as it was left.
                      picked={shown ? step.picked : question.picks}
                      pressed={step.name === `next${at}`}
                    />,
                    `q${at}`
                  )
                })}
                {screen(
                  CLICK_QUESTIONS.length + 1,
                  <DemoInvitation
                    voice
                    action={
                      <DemoStartAction
                        access={accessAt(index)}
                        pledged={voice && after("vPledge")}
                        pressed={step.name === "vStart"}
                      />
                    }
                  />
                )}
                {screen(
                  CLICK_QUESTIONS.length + 2,
                  <DemoVoiceSession
                    active={voice && step.screen === "voice"}
                    status={status}
                    picked={voicePicked}
                  />
                )}
              </div>
            </div>
            {/* The click-mode interview finished, and the voice answer saved. */}
            {BURSTS.includes(step.name) && <PromoBurst key={step.name} />}
          </div>
        </DemoPanel>
      </div>
    </div>
  )
}
