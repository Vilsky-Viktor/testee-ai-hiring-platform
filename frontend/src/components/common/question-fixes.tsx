"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { DotsMenu } from "@/components/common/dots-menu"
import { apiFetch } from "@/lib/api"

/** An owner's or admin's fixes to a question, in its "⋮" menu: re-generate it, or say its marked
 * answer is wrong (the verifier checks it and fixes or replaces it). */
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

  const items = [
    ...(canRegenerate
      ? [
          {
            label: regenerating ? t("regenerating") : t("regenerate"),
            onClick: onRegenerate,
            disabled: busy,
          },
        ]
      : []),
    ...(wrongPath
      ? [
          {
            label: markedWrong ? t("checking") : t("wrongAnswer"),
            onClick: markWrong,
            disabled: busy || markedWrong,
          },
        ]
      : []),
  ]

  return items.length > 0 ? <DotsMenu items={items} /> : null
}
