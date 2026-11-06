"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { useSavedMark } from "@/hooks/use-saved-mark"
import { apiErrorMessage, apiFetch } from "@/lib/api"
import type { InterviewSettingsData } from "@/types/company"
import { TEXT_LINK } from "@/config/links"
import { VOICE_GUIDE_PATH } from "@/config/voice"
import { LocalizedLink } from "@/components/common/localized-link"
import { AnswerModeSetting } from "@/features/company/components/answer-mode-switch"
import {
  NumberSetting,
  SettingsGroup,
  SwitchSetting,
} from "@/features/company/components/setting-rows"

/** The interview's settings tab: whether it's taken in click mode or voice mode (with the guide
to voice mode's quality in each language), the average time per question (each question gets its own, fitted
to it by rounds), the pass mark, whether the company hired, and whether its questions stay out of
testee's shared question bank, grouped, saving as they change and saying so on the row.
Every interview is timed, and candidates never see their scores. */
export function InterviewSettings({
  interviewId,
  questionSeconds,
  passMark,
  hired,
  keepPrivate,
  voice,
}: {
  interviewId: string
  questionSeconds: number
  passMark: number
  hired: boolean
  keepPrivate: boolean
  // Taken in voice mode (click mode otherwise, the default).
  voice: boolean
}) {
  const t = useTranslations("interviews")
  const router = useRouter()
  const [saved, setSaved] = useState<InterviewSettingsData>({
    question_seconds: questionSeconds,
    hired,
    pass_mark: passMark,
    keep_private: keepPrivate,
    voice,
  })
  const [seconds, setSeconds] = useState(String(questionSeconds))
  const [mark, setMark] = useState(String(passMark))
  const [saving, setSaving] = useState(false)
  const { markSaved, savedText } = useSavedMark<keyof InterviewSettingsData>()

  // Every setting goes together, so saving one never resets the others. The API checks the
  // ranges; its message shows if a value doesn't fit, and the field goes back.
  async function save(change: Partial<InterviewSettingsData>) {
    const next = { ...saved, ...change }

    if (saving || JSON.stringify(next) === JSON.stringify(saved)) {
      return
    }

    setSaving(true)

    try {
      await apiFetch(`/companies/interviews/${interviewId}/settings`, {
        method: "PATCH",
        body: JSON.stringify(next),
      })
      setSaved(next)
      markSaved((Object.keys(change) as (keyof InterviewSettingsData)[])[0])
      router.refresh()
    } catch (error) {
      setSeconds(String(saved.question_seconds))
      setMark(String(saved.pass_mark))
      toast.error(apiErrorMessage(error, t("settingsFailed")))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <SettingsGroup title={t("settingsRuns")}>
        <AnswerModeSetting
          label={t("answerMode")}
          help={t.rich("answerModeHelp", {
            link: (chunks) => (
              <LocalizedLink href={VOICE_GUIDE_PATH} className={TEXT_LINK}>
                {chunks}
              </LocalizedLink>
            ),
          })}
          voice={saved.voice}
          saved={savedText("voice")}
          disabled={saving}
          onChange={(on) => save({ voice: on })}
        />
        <NumberSetting
          label={t("timePerQuestion")}
          help={t("timePerQuestionHelp")}
          fieldName={t("secondsLabel")}
          unit={t("secondsUnit")}
          value={seconds}
          saved={savedText("question_seconds")}
          disabled={saving}
          onChange={setSeconds}
          onSave={() => save({ question_seconds: Number(seconds) })}
        />
        <NumberSetting
          label={t("passMark")}
          fieldName={t("passMarkLabel")}
          unit="%"
          value={mark}
          saved={savedText("pass_mark")}
          disabled={saving}
          onChange={setMark}
          onSave={() => save({ pass_mark: Number(mark) })}
        />
      </SettingsGroup>
      <SettingsGroup title={t("settingsAfter")}>
        <SwitchSetting
          label={t("markHired")}
          checked={saved.hired}
          saved={savedText("hired")}
          disabled={saving}
          onChange={(checked) => save({ hired: checked })}
        />
        <SwitchSetting
          label={t("keepPrivate")}
          help={t("keepPrivateHelp")}
          checked={saved.keep_private}
          saved={savedText("keep_private")}
          disabled={saving}
          onChange={(checked) => save({ keep_private: checked })}
        />
      </SettingsGroup>
    </>
  )
}
