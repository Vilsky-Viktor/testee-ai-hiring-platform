"use client"

import { cn } from "cn"
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { FEEDBACK_HOVER_CLASS } from "@/config/feedback"
import { apiFetch } from "@/lib/api"
import { nextVote, type Thumb } from "@/lib/question-votes"

export function QuestionRating({ basePath }: { basePath: string }) {
  const t = useTranslations("questions")
  const [value, setValue] = useState<Thumb | null>(null)
  const [saving, setSaving] = useState(false)
  // Set once the user votes, so a slow load of the saved vote doesn't overwrite theirs.
  const voted = useRef(false)

  useEffect(() => {
    voted.current = false
    apiFetch<{ value: Thumb | null }>(`${basePath}/rating`)
      .then((body) => {
        if (!voted.current) {
          setValue(body.value)
        }
      })
      .catch(() => {})
  }, [basePath])

  // The other thumb switches the vote; the same one again takes it back (a click by mistake).
  async function rate(clicked: Thumb) {
    if (saving) {
      return
    }

    const previous = value
    const next = nextVote(value, clicked)
    voted.current = true
    setValue(next)
    setSaving(true)

    try {
      await apiFetch(
        `${basePath}/rating`,
        next === null
          ? { method: "DELETE" }
          : { method: "PUT", body: JSON.stringify({ value: next }) }
      )
    } catch {
      setValue(previous)
      toast.error(t("ratingFailed"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="contents">
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        aria-label={t("helpful")}
        className={cn(FEEDBACK_HOVER_CLASS, "h-full w-full rounded-none")}
        aria-pressed={value === 1}
        onClick={() => rate(1)}
      >
        <ThumbsUpIcon
          className={cn("size-6", value === 1 && "fill-primary text-primary")}
        />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        aria-label={t("unhelpful")}
        className={cn(FEEDBACK_HOVER_CLASS, "h-full w-full rounded-none")}
        aria-pressed={value === -1}
        onClick={() => rate(-1)}
      >
        <ThumbsDownIcon
          className={cn("size-6", value === -1 && "fill-primary text-primary")}
        />
      </Button>
    </div>
  )
}
