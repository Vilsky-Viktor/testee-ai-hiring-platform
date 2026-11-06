"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"
import { HashIcon, PlusIcon, SendHorizontalIcon, UsersIcon } from "lucide-react"

import { DemoSlackSidebar } from "@/features/landing/components/demo-slack-sidebar"
import { SlackMessage } from "@/components/common/slack-message"
import { useElementSize } from "@/hooks/use-element-size"
import {
  DEMO_SLACK_APP,
  DEMO_SLACK_CHANNEL,
  DEMO_SLACK_FINISHED,
  DEMO_SLACK_MEMBERS,
  DEMO_SLACK_NOTE_TIME,
} from "@/config/reports-slack-demo"
import { DEMO_AUTHOR } from "@/config/reports-demo"
import {
  useDemoContent,
  useReportCandidates,
} from "@/features/landing/hooks/use-demo-content"
import { SLACK } from "@/config/slack"

/** A Slack channel as Slack lays it out, for the landing: the workspace's side menu, then the
 * channel's header with Slack's mark,
 * its name and members; testee's messages, each from the app (testee's mark as its square
 * picture, its name, the APP tag and the time) with the blocks testee sends (a plain-text section
 * and an "Open in testee" button): candidates' "finished" messages, then the `note` just posted;
 * and the message box. Scrolled to the newest message once
 * `scrolled`, gliding there. Each time the channel is `shown`, its messages fly in one after
 * another. */
export function DemoSlackChannel({
  shown,
  scrolled,
  note,
}: {
  shown: boolean
  scrolled: boolean
  // The note posted on the interview's notes just before, the channel's newest message.
  note: string
}) {
  const t = useTranslations("landing.demoContent.slack")
  const slack = useDemoContent("slack")
  const { title } = useDemoContent("reports")
  const candidates = useReportCandidates()
  const channel = slack.channels[DEMO_SLACK_CHANNEL]
  const { ref: windowRef, size: windowSize } = useElementSize<HTMLDivElement>()
  const { ref: listRef, size: listSize } = useElementSize<HTMLDivElement>()
  const room =
    windowSize && listSize
      ? Math.max(0, listSize.height - windowSize.height)
      : 0

  // One of testee's messages: the app's picture, name, tag and `time`, its `body` and the button;
  // flying in, the `index`-th, each time the channel is shown.
  function message(
    key: string,
    index: number,
    time: string,
    body: React.ReactNode
  ) {
    return (
      <SlackMessage
        key={key}
        app={DEMO_SLACK_APP}
        tag={slack.app}
        time={time}
        button={slack.button}
        style={{ animationDelay: `${250 + index * 80}ms` }}
        className={cn(
          shown &&
            "motion-safe:animate-[promo-fly-in_0.5s_cubic-bezier(0.2,0.9,0.3,1.2)_both] rtl:[--fly-from:1]"
        )}
      >
        {body}
      </SlackMessage>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border">
      <DemoSlackSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <p className="flex items-center gap-2 text-lg font-bold">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={SLACK.logo} alt="" className="size-5" />
            <span className="flex items-center">
              <HashIcon className="size-5" />
              {channel}
            </span>
          </p>
          <span className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs text-muted-foreground">
            <UsersIcon className="size-3.5" />
            {DEMO_SLACK_MEMBERS}
          </span>
        </div>
        <div
          ref={windowRef}
          className="relative min-h-0 flex-1 overflow-hidden"
        >
          <div
            ref={listRef}
            style={{ transform: `translateY(${scrolled ? -room : 0}px)` }}
            className="absolute inset-x-0 top-0 space-y-1 py-3 transition-transform duration-3000 ease-in-out motion-reduce:transition-none"
          >
            {DEMO_SLACK_FINISHED.map(({ candidate, time }, index) =>
              message(
                String(candidate),
                index,
                time,
                // A "finished" message as testee posts it
                // (services/notifications/helpers/slack.py): who finished the interview, and
                // their grade.
                <p className="text-sm leading-snug break-words">
                  {t("finished", {
                    name: candidates[candidate].name,
                    email: candidates[candidate].email,
                    title,
                    grade: candidates[candidate].grade ?? 0,
                  })}
                </p>
              )
            )}
            {/* The note just posted, as Slack gets every note: who wrote it on which
                interview, then the note itself, as written. */}
            {message(
              "note",
              DEMO_SLACK_FINISHED.length,
              DEMO_SLACK_NOTE_TIME,
              <>
                <p className="text-sm leading-snug break-words">
                  {t("noted", { author: DEMO_AUTHOR, title })}
                </p>
                <p className="text-sm leading-snug break-words">{note}</p>
              </>
            )}
          </div>
        </div>
        {/* The channel's message box. */}
        <div className="m-3 mt-0 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-muted-foreground">
          <PlusIcon className="size-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">
            {t("composer", { channel })}
          </span>
          <SendHorizontalIcon className="size-4 shrink-0" />
        </div>
      </div>
    </div>
  )
}
