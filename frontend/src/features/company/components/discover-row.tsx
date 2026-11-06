"use client"

import { cn } from "cn"
import { CheckIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { SUBTOPIC_TAG } from "@/components/common/subtopic-list"
import { LinkedInIcon } from "@/components/icons/brand-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ROW_HOVER, ROW_ICON } from "@/config/lists"
import { useLocalTime } from "@/hooks/use-local-time"
import { apiErrorMessage, apiFetch } from "@/lib/api"
import { bdiText } from "@/lib/bidi"
import { formatPercent } from "@/lib/format"
import { firstGrapheme } from "@/lib/graphemes"
import type { DiscoverPerson } from "@/types/company"

/** One person open to offers on an interview's Discover tab, laid out like a candidate's row:
 * their initial and name, when they last practised and their latest practice result on each of
 * the interview's subjects (practice results, never a ranking); their LinkedIn profile, and, for
 * owners and admins (`canEdit`), the button that invites them as any candidate, staying marked
 * once they're invited. */
export function DiscoverRow({
  person,
  invitePath,
  canEdit,
}: {
  person: DiscoverPerson
  invitePath: string
  canEdit: boolean
}) {
  const t = useTranslations("interviews")
  const locale = useLocale()
  const localTime = useLocalTime()
  const [state, setState] = useState<"idle" | "inviting" | "invited">(
    person.invited ? "invited" : "idle"
  )
  const latest = person.results[0]?.finished_at
  const shownName = person.name ?? t("discoverNoName")

  async function invite() {
    setState("inviting")

    try {
      await apiFetch(invitePath, { method: "POST" })
      setState("invited")
      toast.success(
        t.markup("discoverInviteDone", { ...bdiText, name: shownName })
      )
    } catch (error) {
      setState("idle")
      toast.error(apiErrorMessage(error, t("discoverInviteFailed")))
    }
  }

  return (
    <div
      className={`group/row @container ${ROW_HOVER}`}
      data-testid="discover-row"
    >
      <div className="flex items-start gap-4 p-4 @xl:p-6">
        <span aria-hidden className={cn(ROW_ICON, "font-medium")}>
          {firstGrapheme(shownName).toUpperCase()}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-4 @xl:flex-row @xl:items-center @xl:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="space-y-1">
              <p className="text-lg font-medium break-words">
                <bdi>{shownName}</bdi>
              </p>
              {latest && (
                <p className="text-sm text-muted-foreground">
                  <time dateTime={latest} suppressHydrationWarning>
                    {t("discoverPractised", { date: localTime.date(latest) })}
                  </time>
                </p>
              )}
            </div>
            {/* Each matching subject's latest practice grade, labelled as practice, in no
                colour: nothing here judges anyone. */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {t("discoverResults")}
              </p>
              <ul
                aria-label={t("discoverResults")}
                className="flex flex-wrap gap-2"
              >
                {person.results.map((result) => (
                  <li key={result.topic_title}>
                    <Badge variant="outline" className={SUBTOPIC_TAG}>
                      {result.topic_title}
                      <span className="font-medium text-foreground tabular-nums">
                        {formatPercent(result.score, locale)}
                      </span>
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* On phones the buttons share their own line. */}
          <div className="flex shrink-0 items-center gap-3">
            <Button
              variant="outline"
              className="h-10 px-4 text-base normal-case max-sm:flex-1"
              nativeButton={false}
              render={
                <a
                  href={person.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={t("discoverLinkedIn", { name: shownName })}
                />
              }
            >
              <LinkedInIcon className="size-5" />
              {t("discoverLinkedInLabel")}
            </Button>
            {canEdit && (
              <Button
                variant={state === "invited" ? "outline" : "default"}
                className="h-10 px-5 text-base max-sm:flex-1"
                data-testid="discover-invite"
                disabled={state !== "idle"}
                onClick={invite}
              >
                {state === "invited" && <CheckIcon />}
                {state === "inviting"
                  ? t("discoverInviting")
                  : state === "invited"
                    ? t("discoverInvited")
                    : t("discoverInvite")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
