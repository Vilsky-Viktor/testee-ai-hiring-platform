import { cn } from "cn"
import type { CSSProperties, ReactNode } from "react"

import { Wordmark } from "@/components/common/wordmark"

/** One of testee's messages as Slack shows it: testee's mark as its square picture, the app's
 * name, the `tag` saying it's an app and the `time`, then the message (`children`) and its
 * `button`. */
export function SlackMessage({
  app,
  tag,
  time,
  button,
  className,
  style,
  children,
}: {
  app: string
  tag: string
  time: string
  button: string
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <div style={style} className={cn("flex gap-2.5 px-4 py-2", className)}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface">
        <Wordmark short className="text-lg leading-none" />
      </span>
      <div className="min-w-0 space-y-1.5">
        <p className="flex items-center gap-1.5 text-sm">
          <span className="font-bold">{app}</span>
          <span className="rounded-sm bg-surface px-1 text-[0.625rem] font-medium text-muted-foreground">
            {tag}
          </span>
          <span className="text-xs text-muted-foreground">{time}</span>
        </p>
        {children}
        <span className="inline-flex h-7 items-center rounded-md border px-3 text-xs font-bold">
          {button}
        </span>
      </div>
    </div>
  )
}
