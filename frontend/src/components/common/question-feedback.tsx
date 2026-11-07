"use client"

import { cn } from "cn"
import { FlagIcon, ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { type ReactNode, useState } from "react"
import { toast } from "sonner"

import { IconStat } from "@/components/common/icon-stat"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ROUND_ICON_BUTTON } from "@/config/buttons"
import { apiErrorMessage } from "@/lib/api"
import { nextVote, saveVote, type Thumb, withVote } from "@/lib/question-votes"
import type { QuestionStats } from "@/types/feedback"

// A round icon button with its count, hovered like the stats beside it.
const STAT_BUTTON = cn(
  ROUND_ICON_BUTTON,
  "-mx-2 -my-1 flex cursor-pointer items-center gap-1.5 px-2 py-1 transition-colors disabled:cursor-default aria-expanded:bg-surface aria-expanded:text-foreground aria-pressed:text-primary"
)

function StatButton({
  label,
  icon,
  count,
  ...props
}: React.ComponentProps<"button"> & {
  label: string
  icon: ReactNode
  count: number
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<button type="button" className={STAT_BUTTON} {...props} />}
      >
        {icon}
        {/* Its name says what it counts and how many ("Likes 3"). */}
        <span className="sr-only">{label}</span>
        {count}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/** A question's likes, dislikes and reports. With `ratingPath` a member likes or dislikes it by
 * clicking (the other one switches, the same one again takes it back); with `onToggleReports`
 * its reports open below. */
export function QuestionFeedback({
  question,
  ratingPath,
  showReports,
  onToggleReports,
  onChange,
}: {
  question: QuestionStats
  ratingPath?: string
  showReports: boolean
  onToggleReports?: () => void
  onChange: (question: QuestionStats) => void
}) {
  const t = useTranslations("questions")
  const [saving, setSaving] = useState(false)

  // Clicking the other thumb switches the vote; clicking its own again takes it back.
  async function rate(value: Thumb) {
    if (!ratingPath || saving) {
      return
    }

    const before = question
    const previous = question.my_rating ?? null
    const next = nextVote(previous, value)
    onChange(withVote(question, next))
    setSaving(true)

    try {
      await saveVote(ratingPath, previous, next)
    } catch (error) {
      onChange(before)
      toast.error(apiErrorMessage(error, t("ratingFailed")))
    } finally {
      setSaving(false)
    }
  }

  const thumbIcon = (Icon: typeof ThumbsUpIcon, mine: boolean) => (
    <Icon aria-hidden className={cn("size-4", mine && "fill-current")} />
  )

  return (
    <span className="flex items-center gap-4">
      {ratingPath ? (
        <>
          <StatButton
            label={t("likes")}
            icon={thumbIcon(ThumbsUpIcon, question.my_rating === 1)}
            count={question.likes}
            aria-pressed={question.my_rating === 1}
            onClick={() => rate(1)}
          />
          <StatButton
            label={t("dislikes")}
            icon={thumbIcon(ThumbsDownIcon, question.my_rating === -1)}
            count={question.dislikes}
            aria-pressed={question.my_rating === -1}
            onClick={() => rate(-1)}
          />
        </>
      ) : (
        <>
          <IconStat
            label={t("likes")}
            icon={<ThumbsUpIcon aria-hidden className="size-4" />}
          >
            {question.likes}
          </IconStat>
          <IconStat
            label={t("dislikes")}
            icon={<ThumbsDownIcon aria-hidden className="size-4" />}
          >
            {question.dislikes}
          </IconStat>
        </>
      )}
      {onToggleReports ? (
        <StatButton
          label={t("showReports", { count: question.reports })}
          // Its label already carries the count.
          aria-label={t("showReports", { count: question.reports })}
          icon={
            <FlagIcon
              aria-hidden
              className={cn("size-4", question.reported && "fill-current")}
            />
          }
          count={question.reports}
          aria-expanded={showReports}
          onClick={onToggleReports}
        />
      ) : (
        <IconStat
          label={t("reports")}
          icon={<FlagIcon aria-hidden className="size-4" />}
        >
          {question.reports}
        </IconStat>
      )}
    </span>
  )
}
