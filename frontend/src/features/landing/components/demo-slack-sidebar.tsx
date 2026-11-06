import { cn } from "cn"
import { HashIcon } from "lucide-react"

import { Wordmark } from "@/components/common/wordmark"
import {
  DEMO_SLACK_APP,
  DEMO_SLACK_CHANNEL,
  DEMO_SLACK_SIDEBAR,
} from "@/config/reports-slack-demo"
import { useDemoContent } from "@/features/landing/hooks/use-demo-content"

const ROW = "flex items-center gap-2 rounded-md px-2 py-1 truncate"

/** Slack's side menu, small, for the landing: the workspace's name, its channels with the open
 * one highlighted, teammates with their status dots and the testee app, white on Slack's
 * aubergine. Not on phones, where Slack shows the channel alone. */
export function DemoSlackSidebar() {
  const { workspace, people, background, current, active } = DEMO_SLACK_SIDEBAR
  const slack = useDemoContent("slack")

  return (
    <div
      style={{ backgroundColor: background }}
      className="flex w-44 shrink-0 flex-col gap-4 p-3 text-sm text-white/70 max-sm:hidden"
    >
      <p className="px-2 text-base font-bold text-white">{workspace}</p>
      <div className="space-y-0.5">
        <p className="px-2 pb-1 text-xs">{slack.channelsTitle}</p>
        {slack.channels.map((channel, place) => (
          <p
            key={channel}
            style={
              place === DEMO_SLACK_CHANNEL
                ? { backgroundColor: current }
                : undefined
            }
            className={cn(ROW, place === DEMO_SLACK_CHANNEL && "text-white")}
          >
            <HashIcon className="size-4 shrink-0" />
            {channel}
          </p>
        ))}
      </div>
      <div className="space-y-0.5">
        <p className="px-2 pb-1 text-xs">{slack.peopleTitle}</p>
        {people.map((person) => (
          <p key={person.name} className={ROW}>
            <span
              style={active && person.active ? { backgroundColor: active } : {}}
              className={cn(
                "size-2 shrink-0 rounded-full",
                !person.active && "border border-white/70"
              )}
            />
            {person.name}
          </p>
        ))}
      </div>
      <div className="space-y-0.5">
        <p className="px-2 pb-1 text-xs">{slack.appsTitle}</p>
        <p className={ROW}>
          <span className="flex size-4 shrink-0 items-center justify-center rounded-sm bg-white text-foreground">
            <Wordmark short className="text-xs leading-none" />
          </span>
          {DEMO_SLACK_APP}
        </p>
      </div>
    </div>
  )
}
