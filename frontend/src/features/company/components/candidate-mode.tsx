"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { AnswerModeSetting } from "@/features/company/components/answer-mode-switch"
import { useSavedMark } from "@/hooks/use-saved-mark"
import { apiErrorMessage, apiFetch } from "@/lib/api"

/** How one candidate takes the interview, by click or voice, apart from the interview's mode:
 * the settings' switch, shown only while the API lets the user change it
 * (`editable`: before the candidate starts); afterwards nothing, as the mode is fixed. */
export function CandidateMode({
  interviewId,
  inviteId,
  voice,
  editable,
}: {
  interviewId: string
  inviteId: string
  voice: boolean
  editable: boolean
}) {
  const t = useTranslations("candidates")
  const interviews = useTranslations("interviews")
  const router = useRouter()
  const [current, setCurrent] = useState(voice)
  const [saving, setSaving] = useState(false)
  const { markSaved, savedText } = useSavedMark()

  async function choose(next: boolean) {
    setSaving(true)

    try {
      await apiFetch(
        `/companies/interviews/${interviewId}/candidates/${inviteId}/voice`,
        { method: "PUT", body: JSON.stringify({ voice: next }) }
      )
      setCurrent(next)
      markSaved()
      router.refresh()
    } catch (error) {
      toast.error(apiErrorMessage(error, t("modeFailed")))
    } finally {
      setSaving(false)
    }
  }

  if (!editable) {
    return null
  }

  return (
    <div data-testid="candidate-mode">
      <AnswerModeSetting
        label={interviews("answerMode")}
        help={t("modeHelp")}
        voice={current}
        saved={savedText()}
        disabled={saving}
        onChange={choose}
      />
    </div>
  )
}
