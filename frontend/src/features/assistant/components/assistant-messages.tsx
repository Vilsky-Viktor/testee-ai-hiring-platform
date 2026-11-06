"use client"

import { cn } from "cn"
import { ArrowRightIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { AnswerBlocks } from "@/features/assistant/components/answer-blocks"
import { type CardActions } from "@/features/assistant/components/action-card"
import { AnswerMarkdown } from "@/features/assistant/components/answer-markdown"
import { AnswerVote } from "@/features/assistant/components/answer-vote"
import { ChatBubble, ThinkingDots } from "@/components/common/chat-bubble"
import { KeepAcronyms } from "@/components/common/keep-acronyms"
import { MiraName } from "@/components/common/mira-name"
import { Button } from "@/components/ui/button"
import { WELCOME_QUESTIONS } from "@/config/assistant"
import { hasMessage } from "@/lib/messages"
import type { ChatMessage, Vote } from "@/types/assistant"

/** The conversation in the panel: questions, answers with what their tools found, the tools
 * at work while one is written, and a failed answer's error with Try again. With no messages
 * yet, a welcome for the user's stage: what the assistant helps with there, and questions to
 * tap, first "What can I do on this page?" on a page with a guide (`onPage`). Under the latest
 * answer and any voted on, thumbs up and down; under the others, on hover. */
export function AssistantMessages({
  messages,
  streaming,
  signedIn,
  stage,
  onPage,
  onAsk,
  onRetry,
  onVote,
  onNavigate,
  actions,
  earlier = false,
  onEarlier,
}: {
  messages: ChatMessage[]
  streaming: boolean
  signedIn: boolean
  // The user's stage ("signed_out" when signed out), which the welcome is about; null while
  // it's unknown.
  stage: string | null
  onPage: boolean
  onAsk: (question: string) => void
  onRetry: () => void
  onVote: (index: number, value: Vote | null) => void
  onNavigate: () => void
  actions: CardActions
  // Earlier messages of the conversation are left to show (onEarlier loads them).
  earlier?: boolean
  onEarlier?: () => void
}) {
  const t = useTranslations("assistant")

  if (messages.length === 0) {
    const questions = (stage && WELCOME_QUESTIONS[stage]) || []
    const asks = [
      ...(onPage ? [t("pageQuestion")] : []),
      ...questions.flatMap((key) => {
        const question = `welcome.${stage}.questions.${key}` as const

        return hasMessage(t, question) ? [t(question)] : []
      }),
    ]
    const text = `welcome.${stage}.text` as const

    return (
      <div className="space-y-6 py-6" data-testid={`welcome-${stage}`}>
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-medium tracking-tight">
            <KeepAcronyms
              text={signedIn ? t("emptyTitle") : t("emptyTitleFaq")}
            />
          </h2>
          <p className="text-base text-muted-foreground">
            {questions.length > 0 && hasMessage(t, text)
              ? t(text)
              : t("emptyText")}
          </p>
        </div>
        <ul className="space-y-2">
          {asks.map((question) => (
            <li key={question}>
              <Button
                variant="ghost"
                className="h-auto w-full justify-between gap-3 rounded-xl bg-surface px-4 py-3 text-start text-base whitespace-normal normal-case hover:bg-input"
                onClick={() => onAsk(question)}
              >
                {question}
                <ArrowRightIcon
                  data-icon="inline-end"
                  className="text-muted-foreground rtl:-scale-x-100"
                />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const last = messages.at(-1)
  // Screen readers hear each answer once, whole, not every streamed piece of it.
  const answered = !streaming && last?.role === "assistant" ? last.content : ""

  return (
    <>
      {earlier && onEarlier && (
        <div className="flex justify-center pb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEarlier}
            data-testid="earlier-messages"
          >
            {t("earlierMessages")}
          </Button>
        </div>
      )}
      <ul className="space-y-6">
        {messages.map((message, index) => {
          if (message.removed) {
            return (
              <li
                key={index}
                className="ms-auto w-fit text-sm text-muted-foreground italic"
                data-testid="message-removed"
              >
                {t("removed")}
              </li>
            )
          }

          if (message.role === "user") {
            return (
              <ChatBubble key={index} role="user" content={message.content} />
            )
          }

          const writing = streaming && index === messages.length - 1
          const last = index === messages.length - 1

          // One card per answer: the tools at work and the dots while it's written, its text,
          // and its error; what its tools found sits right under it.
          return [
            (writing || message.content || message.error) && (
              <AssistantAnswer
                key={`${index}-text`}
                message={message}
                writing={writing}
                last={last}
                onVote={(value) => onVote(index, value)}
                onRetry={onRetry}
                onNavigate={onNavigate}
              />
            ),
            message.blocks.length > 0 && (
              <li key={`${index}-blocks`}>
                <AnswerBlocks
                  blocks={message.blocks}
                  actions={actions}
                  onNavigate={onNavigate}
                />
              </li>
            ),
          ]
        })}
      </ul>
      <p aria-live="polite" className="sr-only">
        {answered}
      </p>
    </>
  )
}

/** One answer: Mira's name, then what she's doing now, one line replaced as she goes (dots before
 * the first step), until her text starts, and its error (with Try again on the last one). A
 * written answer, saved by the assistant or signed by the help chat, can be voted on, right under
 * it. */
function AssistantAnswer({
  message,
  writing,
  last,
  onVote,
  onRetry,
  onNavigate,
}: {
  message: ChatMessage
  writing: boolean
  last: boolean
  onVote: (value: Vote | null) => void
  onRetry: () => void
  onNavigate: () => void
}) {
  const common = useTranslations("common")
  const working = writing && !message.content

  return (
    <ChatBubble
      role="assistant"
      className="space-y-2 whitespace-normal"
      after={
        !writing &&
        message.content &&
        !message.error &&
        (message.id || message.helpAnswer) && (
          <QuietVote
            quiet={!last && !message.vote}
            value={message.vote ?? null}
            onVote={onVote}
          />
        )
      }
      content={
        <>
          <MiraName working={working} />
          {working && <AnswerStep step={message.progress?.at(-1)} />}
          {message.content && (
            <AnswerMarkdown text={message.content} onNavigate={onNavigate} />
          )}
          {message.error && (
            <span className="flex flex-wrap items-center gap-3 text-destructive">
              {message.error}
              {last && (
                <Button variant="outline" size="sm" onClick={onRetry}>
                  {common("retry")}
                </Button>
              )}
            </span>
          )}
        </>
      }
    />
  )
}

/** What Mira is doing before her text starts: the `step` she's on, or dots before the first. */
function AnswerStep({ step }: { step?: string }) {
  const common = useTranslations("common")

  return step ? (
    <p key={step} className="animate-in text-sm text-muted-foreground fade-in">
      {step}
    </p>
  ) : (
    <span className="flex h-5 items-center gap-1">
      <ThinkingDots label={common("thinking")} />
    </span>
  )
}

/** An answer's votes; `quiet`, they show only while it's hovered or they're focused (always on
 * touch screens). */
function QuietVote({
  quiet,
  value,
  onVote,
}: {
  quiet: boolean
  value: Vote | null
  onVote: (value: Vote | null) => void
}) {
  return (
    <div
      className={cn(
        quiet &&
          "opacity-0 transition-opacity group-hover/answer:opacity-100 focus-within:opacity-100 pointer-coarse:opacity-100"
      )}
    >
      <AnswerVote value={value} onVote={onVote} />
    </div>
  )
}
