"use client"

import { cn } from "cn"
import { HistoryIcon, SparklesIcon, SquarePenIcon, XIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Fragment, useEffect, useRef, useState } from "react"

import { ChatBubble } from "@/components/common/chat-bubble"
import { MiraName } from "@/components/common/mira-name"
import { AskAgentCards } from "@/features/landing/components/ask-agent-cards"
import { DemoActionCard } from "@/features/landing/components/demo-action-card"
import { DemoChatInput } from "@/features/landing/components/demo-chat-input"
import { DemoPointer } from "@/features/landing/components/demo-pointer"
import { PromoBurst } from "@/features/landing/components/promo-burst"
import { useClickBump } from "@/features/landing/hooks/use-click-bump"
import { useSpotlight } from "@/features/landing/hooks/use-spotlight"
import { useDemoMeter } from "@/features/landing/hooks/use-demo-meter"
import { useVoiceWaves } from "@/hooks/use-voice-waves"
import {
  ASK_AGENT_EMAIL,
  ASK_AGENT_QUESTIONS,
  ASK_AGENT_RESULTS,
  type AskAgentQuestion,
} from "@/config/ask-agent-demo"
import { useDemoContent } from "@/features/landing/hooks/use-demo-content"
import { pointedAt, useDemoSteps } from "@/hooks/use-demo-steps"
import {
  demoSteps,
  inputText,
} from "@/features/landing/utils/ask-agent-demo-steps"
import { bdi, bdiText } from "@/lib/bidi"
import { formatPercent } from "@/lib/format"
import { graphemes } from "@/lib/graphemes"

// The promo's motion, with motion allowed: the person's message rising from the input into its
// place; Mira's growing out of a dot at its tail (the bottom of its start side); each landing
// with a small settle. As a question is sent, its text leaves the input, and the send arrow
// flies up out of its button and comes back.
const RISE =
  "motion-safe:animate-[promo-rise_0.55s_cubic-bezier(0.2,0.9,0.3,1)_both] origin-bottom-right rtl:origin-bottom-left"
const GROW =
  "motion-safe:animate-[promo-grow_0.5s_cubic-bezier(0.2,0.9,0.3,1)_both] origin-bottom-left rtl:origin-bottom-right"
const SEND =
  "motion-safe:[&_.demo-pressed]:overflow-hidden motion-safe:[&_.demo-pressed_svg]:animate-[promo-lift_0.4s_ease-in-out] motion-safe:[&_.truncate]:animate-[promo-leave_0.3s_ease-in_forwards]"

/** The assistant's panel answering three questions in turn, played while on screen: how many
 * candidates passed an interview (from its report), how to give extra time (from a guide), and
 * a candidate invited once the pointer confirms the action's card. Beside it, the three things
 * it does, each lit while the chat shows it, with a small bump. A fixed height that scrolls as
 * messages come. Played as a promo: the typed question leaves the input as send is pressed (its
 * arrow flying up and back) and rises into its bubble, Mira's messages grow out of a dot at
 * their tail, each landing with a small settle, and a burst marks the candidate invited
 * (`data-promo`, promo.css). With reduced motion, the whole conversation, still. On phones, the three
 * cards alone. */
export function AskAgentDemo() {
  const t = useTranslations("landing.justAsk")
  const locale = useLocale()
  const assistant = useTranslations("assistant")
  const { interview } = useDemoContent("askAgent")
  const values = { interview, email: ASK_AGENT_EMAIL }
  const questions = Object.fromEntries(
    ASK_AGENT_QUESTIONS.map((key) => [
      key,
      t.markup(`questions.${key}`, { ...values, ...bdiText }),
    ])
  ) as Record<AskAgentQuestion, string>
  const { stats, help, invite } = questions
  // Made once, so the demo plays on as it renders.
  const [steps] = useState(() =>
    demoSteps({
      stats: graphemes(stats).length,
      help: graphemes(help).length,
      invite: graphemes(invite).length,
    })
  )
  const { ref, index, n } = useDemoSteps<HTMLDivElement>(steps)
  const step = steps[index]
  const scroller = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLDivElement>(null)
  const sendRef = useRef<HTMLSpanElement>(null)
  const confirmRef = useRef<HTMLSpanElement>(null)
  const micRef = useRef<HTMLSpanElement>(null)
  const targets = {
    input: inputRef,
    send: sendRef,
    confirm: confirmRef,
    mic: micRef,
  }
  // The voice heard while the microphone is held, moving the input's wave.
  const meter = useDemoMeter(false, step.listening === true)
  const waves = useVoiceWaves(meter, false)
  const point = pointedAt(steps, index)
  const target =
    point && point in targets ? targets[point as keyof typeof targets] : null

  // The input lights up as the pointer heads for it, until the question is sent; what the
  // pointer clicks jumps as the click lands.
  useSpotlight(
    step.name.startsWith("aim-") ||
      step.name.startsWith("focus-") ||
      step.name.startsWith("type-")
      ? inputRef
      : null,
    index
  )
  useClickBump(target, step.click === true, index)
  const asking = step.asking ? questions[step.asking] : null
  const spoken = step.listening || step.transcribing
  const typed = inputText(step, asking, n)
  const { passed, total, passMark, best } = ASK_AGENT_RESULTS
  const answer = (text: React.ReactNode) => (
    <ChatBubble
      role="assistant"
      className={cn("space-y-1 whitespace-normal", GROW)}
      content={
        <>
          <MiraName />
          {text}
        </>
      }
    />
  )
  const question = (key: string, text: string) => (
    <ChatBubble key={key} role="user" className={RISE} content={text} />
  )
  const items = [
    question("q-stats", stats),
    answer(
      t("answers.stats", {
        passed,
        total,
        percent: formatPercent((passed / total) * 100, locale),
        passMark: formatPercent(passMark, locale),
        best: formatPercent(best, locale),
      })
    ),
    question("q-help", help),
    answer(
      t.rich("answers.help", {
        link: (chunks) => (
          <span className="underline underline-offset-4">{chunks}</span>
        ),
      })
    ),
    question("q-invite", invite),
    <DemoActionCard
      key="card"
      state={step.card ?? "done"}
      confirmRef={confirmRef}
      pressed={step.name === "confirm"}
    />,
    answer(t.rich("answers.invite", { ...values, ...bdi })),
  ]

  // The latest message comes into view as it's added; back to the top as the chat starts again.
  useEffect(() => {
    const chat = scroller.current

    chat?.scrollTo({
      top: step.upTo === 0 ? 0 : chat.scrollHeight,
      behavior: step.upTo === 0 ? "instant" : "smooth",
    })
  }, [step.upTo, step.working, step.card])

  return (
    <div
      data-promo
      data-ask-promo
      className="mx-auto grid w-full max-w-4xl gap-4 md:grid-cols-[minmax(0,1fr)_16rem] lg:grid-cols-[minmax(0,1fr)_19rem]"
    >
      <div
        ref={ref}
        aria-hidden
        data-testid="agent-chat"
        className="relative flex h-120 flex-col overflow-hidden rounded-xl bg-surface text-popover-foreground ring-1 ring-foreground/10 motion-reduce:h-auto max-sm:hidden"
      >
        <DemoPointer
          target={target}
          clicking={step.click === true}
          click={index}
        />
        {/* The real panel's own colours, as in the app. */}
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex h-14 shrink-0 items-center gap-3 border-b px-4 text-muted-foreground">
            <SparklesIcon className="size-4 shrink-0 text-primary" />
            <p className="flex-1 truncate font-heading text-lg font-medium text-foreground">
              {assistant("title")}
            </p>
            <SquarePenIcon className="size-5" />
            <HistoryIcon className="size-5" />
            <XIcon className="size-5" />
          </div>
          <div
            ref={scroller}
            className="flex-1 overflow-hidden px-4 pt-4 pb-6 text-start"
          >
            <ul className="space-y-5">
              {/* Mira's welcome, there from the start. */}
              {answer(t("welcome"))}
              {items.slice(0, step.upTo).map((item, at) => (
                <Fragment key={at}>{item}</Fragment>
              ))}
              {step.working && (
                <ChatBubble
                  role="assistant"
                  className={cn("space-y-1 whitespace-normal", GROW)}
                  content={
                    <>
                      <MiraName working />
                      <p
                        key={step.working}
                        className="animate-in text-sm text-muted-foreground fade-in"
                      >
                        {t(`steps.${step.working}`)}
                      </p>
                    </>
                  }
                />
              )}
            </ul>
          </div>
          {/* As it's sent, the typed text leaves the input and the send arrow flies up and
              back. */}
          <div
            className={cn(
              "shrink-0 px-4 pb-4",
              step.name.startsWith("send-") && SEND
            )}
          >
            <DemoChatInput
              ref={inputRef}
              sendRef={sendRef}
              micRef={micRef}
              waveRef={waves.you}
              listening={step.listening}
              transcribing={step.transcribing}
              text={typed}
              typing={
                step.asking !== undefined &&
                !spoken &&
                !step.name.startsWith("send-")
              }
              placeholder={assistant("placeholder")}
              pressed={step.name.startsWith("send-")}
            />
          </div>
        </div>
        {/* The candidate invited. */}
        {step.name === "done" && <PromoBurst />}
      </div>
      <AskAgentCards lit={step.lit} />
    </div>
  )
}
