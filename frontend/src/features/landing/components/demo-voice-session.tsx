"use client"

import { useTranslations } from "next-intl"

import { DemoQuestionCard } from "@/features/landing/components/demo-question"
import { DemoSessionFooter } from "@/features/landing/components/demo-session-footer"
import { DemoSessionHeader } from "@/features/landing/components/demo-session-header"
import { useDemoMeter } from "@/features/landing/hooks/use-demo-meter"
import { VoiceStatusCard } from "@/features/company/components/voice-status"
import { VOICE_QUESTION } from "@/config/candidates-demo"
import { useDemoContent } from "@/features/landing/hooks/use-demo-content"
import { useVoiceWaves } from "@/hooks/use-voice-waves"
import type { VoiceStatus } from "@/types/round"

const NOTHING = () => {}

/** A voice interview's screen (features/company/components/voice-session.tsx), for the landing,
 * with its real parts: the header; the status card on the start side (30%); the question and its options on the other (70%), stacked on phones; the footer with
 * Next once an option is `picked`. The waves move with speech-like levels while their voice talks (`status`), drawn by the real
 * useVoiceWaves. */
export function DemoVoiceSession({
  active,
  status,
  picked,
}: {
  active: boolean
  status: VoiceStatus
  picked: boolean
}) {
  const t = useTranslations("session")
  const question = {
    ...VOICE_QUESTION,
    ...useDemoContent("candidates").questions[VOICE_QUESTION.key],
  }
  const rounds = useTranslations("rounds")
  // The real waves, moved by speech-like levels while each voice talks.
  const meter = useDemoMeter(
    active && status === "speaking",
    active && status === "hearing"
  )
  const waves = useVoiceWaves(meter, status === "speaking")

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6">
      <DemoSessionHeader question={question} active={active} />
      {/* On phones, where it's stacked, what doesn't fit the picture is cut off above the
          footer. */}
      <div className="grid min-h-0 flex-1 content-start gap-6 overflow-hidden lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] lg:items-start lg:gap-10">
        <VoiceStatusCard
          miraRef={waves.mira}
          youRef={waves.you}
          status={status}
          picked={picked}
          heard={null}
          problem={null}
          onSoundOn={NOTHING}
        />
        <DemoQuestionCard
          question={question}
          picked={picked ? VOICE_QUESTION.picks : []}
          appear={active}
        />
      </div>
      <DemoSessionFooter
        finish={t("voiceEnd")}
        next={rounds("next")}
        picked={picked}
        pressed={false}
      />
    </div>
  )
}
