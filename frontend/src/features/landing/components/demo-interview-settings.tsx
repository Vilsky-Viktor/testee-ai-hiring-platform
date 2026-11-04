"use client"

import { useTranslations } from "next-intl"

import { AnswerModeSetting } from "@/features/company/components/answer-mode-switch"
import {
  CheckSetting,
  NumberSetting,
} from "@/features/company/components/interview-settings"
import { DEMO_INTERVIEW } from "@/config/create-demo"
import { LIST_BOX } from "@/config/lists"

const NOTHING = () => {}

/** An interview's settings tab (features/company/components/interview-settings.tsx) with its own
 * rows: the mode, the time per question (`seconds` as typed so far; the pointer's "seconds"), the
 * pass mark, hired and keeping the questions private. */
export function DemoInterviewSettings({ seconds }: { seconds: string }) {
  const t = useTranslations("interviews")

  return (
    <div className={LIST_BOX}>
      <AnswerModeSetting
        label={t("answerMode")}
        help={t.rich("answerModeHelp", {
          link: (chunks) => <span className="font-medium">{chunks}</span>,
        })}
        voice={false}
        disabled={false}
        onChange={NOTHING}
      />
      <NumberSetting
        label={t("timePerQuestion")}
        help={t("timePerQuestionHelp")}
        fieldLabel={t("secondsLabel")}
        unit={t("secondsUnit")}
        value={seconds}
        disabled={false}
        onChange={NOTHING}
        onSave={NOTHING}
        target="seconds"
      />
      <NumberSetting
        label={t("passMark")}
        fieldLabel={t("passMarkLabel")}
        unit="%"
        value={String(DEMO_INTERVIEW.passMark)}
        disabled={false}
        onChange={NOTHING}
        onSave={NOTHING}
      />
      <CheckSetting
        label={t("markHired")}
        checked={false}
        disabled={false}
        onChange={NOTHING}
      />
      <CheckSetting
        label={t("keepPrivate")}
        help={t("keepPrivateHelp")}
        checked={false}
        disabled={false}
        onChange={NOTHING}
      />
    </div>
  )
}
