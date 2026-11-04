"use client"

import { cn } from "cn"
import { BookOpenIcon, ChartColumnIcon, ZapIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { IconCard, PHONE_CARDS } from "@/components/common/icon-card"
import { ASK_AGENT_CARDS } from "@/config/ask-agent-demo"

const ICONS = {
  info: ChartColumnIcon,
  help: BookOpenIcon,
  actions: ZapIcon,
}

/** What the agent does, as cards beside its chat: white like the chat in the light theme, grey in
 * the dark; see-through in the light so the section's glow shows; the one the chat is showing
 * (`lit`) ringed, with a small bump as it lights up (with motion allowed). On phones, without
 * the chat, edge to edge. */
export function AskAgentCards({ lit }: { lit?: string }) {
  const t = useTranslations("landing.justAsk")

  return (
    <ul className={`grid gap-3 md:grid-rows-3 ${PHONE_CARDS}`}>
      {ASK_AGENT_CARDS.map((key) => (
        <IconCard
          key={key}
          icon={ICONS[key]}
          title={t(`cards.${key}.title`)}
          lit={lit === key}
          className={cn(
            "bg-popover/60 ring-1 ring-foreground/10 dark:bg-surface dark:ring-0",
            lit === key && "motion-safe:animate-[promo-tick_0.4s_ease-out]"
          )}
        >
          {t(`cards.${key}.text`)}
        </IconCard>
      ))}
    </ul>
  )
}
