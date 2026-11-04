"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { apiErrorMessage, apiFetch } from "@/lib/api"
import type { QuestionStats } from "@/types/feedback"

// What the tooltip says: what ticking does (owners and admins), or whether it's in (viewers).
function hintKey(canChange: boolean, out: boolean) {
  if (canChange) {
    return out ? "excludedHint" : "includedHint"
  }

  return out ? "excludedView" : "includedView"
}

/** Whether an interview's question is in it: ticked, candidates may get it; unticked, it's left
 * out. With `excludePath` an owner or admin changes it; anyone else only sees it. */
export function QuestionInclude({
  question,
  excludePath,
  onChange,
}: {
  question: QuestionStats
  excludePath?: string
  onChange: (question: QuestionStats) => void
}) {
  const t = useTranslations("questions")
  const [saving, setSaving] = useState(false)
  const out = Boolean(question.excluded)

  async function setIncluded(included: boolean) {
    if (saving) {
      return
    }

    setSaving(true)
    onChange({ ...question, excluded: !included })

    try {
      await apiFetch(`${excludePath}/${question.id}/excluded`, {
        method: "PUT",
        body: JSON.stringify({ excluded: !included }),
      })
    } catch (error) {
      onChange(question)
      toast.error(apiErrorMessage(error, t("excludeFailed")))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <label className="flex cursor-pointer items-center gap-2 has-disabled:cursor-default" />
        }
      >
        <Checkbox
          className="size-6 rounded-lg [&_[data-slot=checkbox-indicator]>svg]:size-4"
          checked={!out}
          disabled={!excludePath}
          onCheckedChange={(checked) => setIncluded(checked)}
          // A name that stays put; ticked or not says whether it is active.
          aria-label={t("active")}
        />
        {/* On phones its state is written beside it. */}
        <span
          aria-hidden
          data-testid="question-state"
          className="text-sm sm:hidden"
        >
          {out ? t("disabled") : t("active")}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        {t(hintKey(Boolean(excludePath), out))}
      </TooltipContent>
    </Tooltip>
  )
}
