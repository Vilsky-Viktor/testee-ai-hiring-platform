"use client"

import { cn } from "cn"
import { ArrowLeftIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { DEMO_PRESSED } from "@/features/landing/components/demo-panel"
import { DemoReportActions } from "@/features/landing/components/demo-share"
import { DemoInterviewSettings } from "@/features/landing/components/demo-interview-settings"
import { DemoInterviewTabs } from "@/features/landing/components/demo-interview-tabs"
import { DemoInterviewTopics } from "@/features/landing/components/demo-interview-topics"
import { InterviewStatus } from "@/components/common/interview-status"
import { buttonVariants } from "@/components/ui/button"
import { DEMO_INTERVIEW } from "@/config/create-demo"
import { useDemoContent } from "@/features/landing/hooks/use-demo-content"

/** A new interview's page (app/companies/[companyId]/interviews/[id]), simplified for the promo:
 * the back arrow before its title (the pointer's "backLink", pressed in while `backPressed`), its
 * title with "new candidate" beside it (`invite`, pressed in while `pressed`) and its `status`
 * under it, its topics, candidates and settings tabs, and its topics with how many questions each
 * candidate gets of each (`limits`, one `focused`); or, with `tab` "settings", its settings, the
 * time per question `seconds` as typed so far. */
export function DemoInterview({
  topics,
  status,
  limits,
  changed,
  focused,
  savedTopic,
  pressed,
  backPressed,
  tab,
  seconds,
  typingSeconds,
  secondsSaved,
}: {
  topics: { name: string; subtopics: string[] }[]
  status: string
  limits: Record<string, number>
  changed: string[]
  focused: string | null
  // The topic whose number just saved.
  savedTopic: string | null
  pressed: boolean
  backPressed: boolean
  tab: "topics" | "settings"
  seconds: string
  typingSeconds: boolean
  secondsSaved: boolean
}) {
  const t = useTranslations("interviews")
  const { title } = useDemoContent("create")
  const { topicQuestions } = DEMO_INTERVIEW

  return (
    <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
      <div className="flex items-start justify-between gap-3 px-1">
        {/* The page's back arrow (components/common/back-link.tsx), beside the title. */}
        <span
          data-demo-target="backLink"
          className={buttonVariants({
            variant: "ghost",
            size: "icon-lg",
            className: cn(
              "-ms-2 size-9 shrink-0 rounded-xl text-muted-foreground",
              backPressed && DEMO_PRESSED
            ),
          })}
        >
          <ArrowLeftIcon className="size-6 rtl:-scale-x-100" />
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="font-heading text-2xl leading-tight font-medium">
            {title}
          </p>
          <InterviewStatus status="new" label={status} />
        </div>
        <span
          data-demo-target="invite"
          className={buttonVariants({
            className: cn(
              "h-10 shrink-0 px-5 text-base",
              pressed && DEMO_PRESSED
            ),
          })}
        >
          {t("newCandidate")}
        </span>
        <DemoReportActions menu={false} pressed={null} />
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 gap-5">
        <DemoInterviewTabs current={tab} counts={{ topics: topics.length }} />
        <div className="min-w-0 flex-1">
          {tab === "settings" ? (
            <DemoInterviewSettings
              seconds={seconds}
              typing={typingSeconds}
              saved={secondsSaved}
            />
          ) : (
            <DemoInterviewTopics
              topics={topics}
              count={topicQuestions}
              limits={limits}
              changed={changed}
              focused={focused}
              saved={savedTopic}
            />
          )}
        </div>
      </div>
    </div>
  )
}
