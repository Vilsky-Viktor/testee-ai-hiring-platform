"use client"

import { CircleAlertIcon, RefreshCwIcon } from "lucide-react"
import { cn } from "cn"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"

/** An owner's or admin's fixes to a question: re-generate it, or say its marked answer is
 * wrong (the verifier checks it and fixes or replaces it). Under each other beside the
 * question; on one line, on phones. */
export function QuestionFixes({
  questionId,
  canRegenerate,
  wrongPath,
  regenerating,
  busy,
  onRegenerate,
}: {
  questionId: string
  canRegenerate: boolean
  wrongPath?: string
  regenerating: boolean
  busy: boolean
  onRegenerate: () => void
}) {
  const t = useTranslations("questions")
  const [markedWrong, setMarkedWrong] = useState(false)

  async function markWrong() {
    setMarkedWrong(true)

    try {
      await apiFetch(`${wrongPath}/${questionId}/wrong`, { method: "POST" })
      toast.success(t("markedWrong"))
    } catch {
      setMarkedWrong(false)
      toast.error(t("markWrongFailed"))
    }
  }

  return (
    <span className="flex flex-col items-end gap-3 max-sm:flex-row">
      {canRegenerate && (
        <Button variant="outline" disabled={busy} onClick={onRegenerate}>
          <RefreshCwIcon
            data-icon="inline-start"
            className={cn(regenerating && "animate-spin")}
          />
          {regenerating ? t("regenerating") : t("regenerate")}
        </Button>
      )}
      {wrongPath && (
        <Button
          variant="outline"
          disabled={busy || markedWrong}
          onClick={markWrong}
        >
          <CircleAlertIcon data-icon="inline-start" />
          {markedWrong ? t("checking") : t("wrongAnswer")}
        </Button>
      )}
    </span>
  )
}
