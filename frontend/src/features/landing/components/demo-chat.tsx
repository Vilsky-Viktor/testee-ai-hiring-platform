"use client"

import { cn } from "cn"
import {
  CheckCheckIcon,
  MessageCircleIcon,
  SendHorizontalIcon,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Caret } from "@/components/common/caret"
import { DEMO_PRESSED } from "@/features/landing/components/demo-panel"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DEMO_PASS_MARK,
  DEMO_REPORT_COMPANY,
  type DemoCandidate,
} from "@/config/reports-demo"
import { useDemoContent } from "@/features/landing/hooks/use-demo-content"
import { useReportTranslate } from "@/hooks/use-report-translate"
import { reportSummary } from "@/lib/report-summary"

// A message in the chat: a candidate's summary as the app writes it, or a line typed; and when.
export type DemoMessage = {
  summary?: DemoCandidate
  text?: string
  time: string
}

/** A candidate's report as the app gives it to the chat summary (lib/report-summary.ts). */
function summaryOf(candidate: DemoCandidate, title: string) {
  return {
    company: DEMO_REPORT_COMPANY,
    logoUrl: null,
    verifiedDomain: null,
    title,
    email: candidate.email,
    name: candidate.name,
    grade: candidate.grade,
    passed: candidate.passed,
    passMark: DEMO_PASS_MARK,
    sections: (candidate.topics ?? []).map((topic) => ({
      id: topic.title,
      topic_title: topic.title,
      final_score: topic.grade,
      passed: topic.grade >= DEMO_PASS_MARK,
      tab_leaves: topic.tab_leaves,
      copies: topic.copies,
      fast_answers: topic.fast_answers,
    })),
  }
}

/** A chat in WhatsApp, where "share" sends a report's text summary, drawn generically for the
 * landing: the app's name and the chat's, the `messages` sent so far (the latest at the bottom,
 * older ones scrolling off the top, each arriving), and the message box (the demo's
 * "chatBox") with `typed` so far (a caret while `typing`) and its send button (the pointer's "chatSend", pressed in while `pressed`). */
export function DemoChat({
  messages,
  typed,
  typing,
  pressed,
}: {
  messages: DemoMessage[]
  typed: string
  typing: boolean
  pressed: boolean
}) {
  const t = useTranslations("landing.shareReports.chat")
  const translate = useReportTranslate()
  const locale = useLocale()
  const { title, chat } = useDemoContent("reports")

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center gap-3 px-1 pt-1">
        <MessageCircleIcon className="size-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{t("app")}</span>
        <Avatar>
          <AvatarFallback className="bg-surface text-xs">
            {chat.initials}
          </AvatarFallback>
        </Avatar>
        <p className="font-medium">{chat.name}</p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-end gap-2 overflow-hidden rounded-xl bg-surface p-3 sm:p-5">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "max-w-[92%] shrink-0 self-end rounded-xl rounded-ee-sm bg-background px-4 pt-3 pb-2 sm:max-w-sm",
              // A summary drops in; a typed line rises from the message box.
              message.summary
                ? "motion-safe:animate-[promo-drop_0.6s_cubic-bezier(0.2,0.9,0.3,1.2)_both]"
                : "motion-safe:animate-[promo-rise_0.6s_cubic-bezier(0.2,0.9,0.3,1.2)_both]"
            )}
          >
            <p className="text-sm leading-relaxed whitespace-pre-line">
              {message.summary
                ? reportSummary(
                    summaryOf(message.summary, title),
                    translate,
                    locale
                  )
                : message.text}
            </p>
            <p className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
              {message.time}
              <CheckCheckIcon className="size-4 text-primary" />
            </p>
          </div>
        ))}
        {/* The message box and its send button. */}
        <div className="mt-1 flex shrink-0 items-center gap-2">
          <span
            data-demo-target="chatBox"
            className={cn(
              "relative flex h-10 min-w-0 flex-1 items-center rounded-full bg-background px-4 text-sm",
              typing && "border-ring-gradient"
            )}
          >
            {typed || typing ? (
              <>
                <span className="truncate">{typed}</span>
                {typing && <Caret />}
              </>
            ) : (
              <span className="truncate text-muted-foreground">
                {t("placeholder")}
              </span>
            )}
          </span>
          <span
            data-demo-target="chatSend"
            // The messenger's own round green send button, its black icon at the usual weight.
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-black transition-all",
              pressed && DEMO_PRESSED
            )}
          >
            <SendHorizontalIcon
              strokeWidth={1.75}
              className="size-5 rtl:-scale-x-100"
            />
          </span>
        </div>
      </div>
    </div>
  )
}
