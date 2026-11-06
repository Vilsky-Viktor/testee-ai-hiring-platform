"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"

import { AnswerModeSetting } from "@/features/company/components/answer-mode-switch"
import {
  NumberSetting,
  SwitchSetting,
} from "@/features/company/components/setting-rows"
import { DEMO_INTERVIEW } from "@/config/create-demo"
import { LIST_BOX } from "@/config/lists"

const NOTHING = () => {}

/** An interview's settings tab (features/company/components/interview-settings.tsx) with its own
 * rows: the mode, the time per question (`seconds` as typed so far; the pointer's "seconds"), the
 * pass mark, hired and keeping the questions private, sliding in one after another; set closer
 * than the real tab, each help on one line, so all fit the frame. */
export function DemoInterviewSettings({
  seconds,
  typing,
  saved,
}: {
  seconds: string
  typing: boolean
  // The time per question just saved: the field's check shows.
  saved: boolean
}) {
  const t = useTranslations("interviews")
  const common = useTranslations("common")

  return (
    // Rows set closer and each help on one smaller line, so every setting fits the frame.
    <div
      data-stagger
      className={cn(
        LIST_BOX,
        "*:py-3 [&_.block.text-sm]:line-clamp-1 [&_.block.text-sm]:text-xs"
      )}
    >
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
        fieldName={t("secondsLabel")}
        unit={t("secondsUnit")}
        value={seconds}
        saved={saved ? common("saved") : null}
        disabled={false}
        onChange={NOTHING}
        onSave={NOTHING}
        target="seconds"
        focused={typing}
        caret={typing}
      />
      <NumberSetting
        label={t("passMark")}
        fieldName={t("passMarkLabel")}
        unit="%"
        value={String(DEMO_INTERVIEW.passMark)}
        disabled={false}
        onChange={NOTHING}
        onSave={NOTHING}
      />
      <SwitchSetting
        label={t("markHired")}
        checked={false}
        disabled={false}
        onChange={NOTHING}
      />
      <SwitchSetting
        label={t("keepPrivate")}
        help={t("keepPrivateHelp")}
        checked={false}
        disabled={false}
        onChange={NOTHING}
      />
    </div>
  )
}
