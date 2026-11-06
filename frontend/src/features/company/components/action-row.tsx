"use client"

import {
  BlocksIcon,
  BriefcaseBusinessIcon,
  Building2Icon,
  DollarSignIcon,
  HistoryIcon,
  type LucideIcon,
  UserRoundIcon,
  UsersIcon,
} from "lucide-react"
import Link from "next/link"
import { useFormatter, useTranslations } from "next-intl"

import { Dot, Dotted } from "@/components/common/dot"
import { ROW_HOVER, ROW_ICON } from "@/config/lists"
import { useLocalTime } from "@/hooks/use-local-time"
import { actionAuthor, actionHref } from "@/lib/action-log"
import { bdi } from "@/lib/bidi"
import { hasMessage } from "@/lib/messages"
import type { CompanyAction } from "@/types/company"

// Each group's icon, as the company's menu shows its page.
const ICONS: Record<string, LucideIcon> = {
  interviews: BriefcaseBusinessIcon,
  candidates: UserRoundIcon,
  team: UsersIcon,
  company: Building2Icon,
  billing: DollarSignIcon,
  integrations: BlocksIcon,
}

/** One action: its group's icon, what a member did and about what, who did it and through what
 * (the assistant, an AI app, the API or an ATS), and when, under its day's heading. An API key
 * is its own author: its row names the key (by its name now) and the way it came. With a
 * `companyId`, a row about a candidate, an interview or a member that's still there opens it. */
export function ActionRow({
  action,
  companyId,
}: {
  action: CompanyAction
  companyId?: string
}) {
  const t = useTranslations("actionLog")
  const format = useFormatter()
  const localTime = useLocalTime()
  const Icon = ICONS[action.group ?? ""] ?? HistoryIcon
  const href = companyId ? actionHref(action, companyId) : null

  // A person who's gone (people are never kept in the log) reads as such.
  function target() {
    if (action.target) {
      return action.target
    }

    if (action.target_kind === "candidate") {
      return t("deletedCandidate")
    }

    return action.target_kind === "member" ? t("formerMember") : null
  }

  // Who took it: a member (or a former one), or an API key with the way it came.
  function author() {
    const who = actionAuthor(action)

    if (who.kind === "member") {
      return who.email
    }

    if (who.kind === "former") {
      return t("formerMember")
    }

    if (who.kind === "key") {
      return t.rich("apiKey", { via: who.via, name: who.name, ...bdi })
    }

    return t("deletedApiKey", { via: who.via })
  }

  // A value from the API by its name in `group`, or as it is when the log has no name for it.
  function named(group: "actions" | "permissions" | "via", value: string) {
    const key = `${group}.${value}` as const

    return hasMessage(t, key) ? t(key) : value
  }

  const content = (
    <span
      className="flex items-center gap-4 p-6"
      data-via={action.via ?? undefined}
    >
      <span aria-hidden className={ROW_ICON}>
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1 space-y-1">
        <span className="block text-lg font-medium">
          {named("actions", action.action)}
          {target() && (
            <span className="font-normal break-words normal-case">
              <Dot />
              {target()}
            </span>
          )}
          {action.removed && action.removed.length > 0 && (
            <span className="font-normal normal-case">
              <Dot />
              {t("removed", {
                permissions: format.list(
                  action.removed.map((item) => named("permissions", item))
                ),
              })}
            </span>
          )}
        </span>
        <span className="block text-sm break-words text-muted-foreground">
          <Dotted
            items={[
              author(),
              !action.key_id && action.via && named("via", action.via),
            ]}
          />
        </span>
      </span>
      <time
        dateTime={action.created_at}
        suppressHydrationWarning
        className="shrink-0 text-sm text-muted-foreground tabular-nums"
      >
        {localTime.time(action.created_at)}
      </time>
    </span>
  )

  return href ? (
    <Link href={href} className={`group/row block ${ROW_HOVER}`}>
      {content}
    </Link>
  ) : (
    <div className={`group/row ${ROW_HOVER}`}>{content}</div>
  )
}
