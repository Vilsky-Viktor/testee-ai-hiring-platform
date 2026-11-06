"use client"

import { cn } from "cn"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { FloatingInput } from "@/components/ui/floating-field"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSavedMark } from "@/hooks/use-saved-mark"
import { apiErrorMessage, apiFetch } from "@/lib/api"

/** How many of a topic's `count` questions each candidate gets, saved as it's left. */
export function TopicLimit({
  path,
  count,
  limit,
}: {
  path: string
  count: number
  limit: number | null
}) {
  const t = useTranslations("questions")
  const router = useRouter()
  const saved = String(limit ?? count)
  const [value, setValue] = useState(saved)
  const [saving, setSaving] = useState(false)
  const { markSaved, savedText } = useSavedMark()

  async function save() {
    const number = Number(value.trim())

    if (value.trim() === saved) {
      return
    }

    if (!Number.isInteger(number) || number < 0 || number > count) {
      toast.error(t("limitRange", { count }))
      setValue(saved)

      return
    }

    setSaving(true)

    try {
      await apiFetch(path, {
        method: "PUT",
        body: JSON.stringify({ limit: number }),
      })
      markSaved()
      router.refresh()
    } catch (error) {
      setValue(saved)
      toast.error(apiErrorMessage(error, t("limitFailed")))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<div />}>
        {/* The header row names it, except on phones, where there's none. */}
        <p
          aria-hidden
          className="pb-1.5 text-sm text-muted-foreground sm:hidden"
        >
          {t("limitShort")}
        </p>
        <FloatingInput
          plain
          label={t("perCandidate")}
          suffix={t("ofCount", { count })}
          saved={savedText()}
          boxClassName="count-field mt-0 w-34 max-sm:w-full [&>span]:mt-0"
          // Room for two digits in the narrow field.
          style={{ paddingInlineStart: "1.25rem" }}
          type="number"
          inputMode="numeric"
          min={0}
          max={count}
          value={value}
          disabled={saving}
          // "What's next" focuses the first one.
          data-topic-limit
          className="[appearance:textfield] pt-1 tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          onChange={(event) => setValue(event.target.value)}
          onBlur={save}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur()
            }
          }}
        />
      </TooltipTrigger>
      <TooltipContent sideOffset={16}>{t("perCandidate")}</TooltipContent>
    </Tooltip>
  )
}

/** The header row of a list of topics with their question counts: its columns' names. Not on
 * phones, where the rows stack; each count has its name there. grey as the site's list headers; `className` gives its side padding. */
export function TopicsHeader({ className }: { className: string }) {
  const t = useTranslations("questions")

  return (
    <li
      aria-hidden
      className={cn(
        "flex items-center justify-between gap-6 bg-surface py-2 text-sm text-muted-foreground max-sm:hidden",
        className
      )}
    >
      <span>{t("topicsColumn")}</span>
      <span className="whitespace-nowrap">{t("limitShort")}</span>
    </li>
  )
}
