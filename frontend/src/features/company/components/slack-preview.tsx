"use client"

import { useTranslations } from "next-intl"

import { SlackMessage } from "@/components/common/slack-message"
import {
  DEMO_SLACK_APP,
  DEMO_SLACK_NOTE_TIME,
} from "@/config/reports-slack-demo"
import { hasMessage } from "@/lib/messages"

/** How a notification of `kind` looks in the channel, with made-up text. */
export function SlackPreview({ kind }: { kind: string }) {
  const t = useTranslations("slack")
  const slack = useTranslations("landing.demoContent.slack")
  const sample = `samples.${kind}` as const

  return (
    <div className="rounded-xl border py-2" data-testid="slack-preview">
      <SlackMessage
        app={DEMO_SLACK_APP}
        tag={slack("app")}
        time={DEMO_SLACK_NOTE_TIME}
        button={slack("button")}
      >
        <p className="text-sm">{hasMessage(t, sample) ? t(sample) : kind}</p>
      </SlackMessage>
    </div>
  )
}
