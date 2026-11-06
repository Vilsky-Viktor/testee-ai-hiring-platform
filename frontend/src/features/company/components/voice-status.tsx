import { cn } from "cn"
import { Volume2Icon } from "lucide-react"
import { useTranslations } from "next-intl"
import type { Ref } from "react"

import { Button } from "@/components/ui/button"
import { FLAT_BAR, MIRA_BARS, YOU_BARS } from "@/config/voice"
import { TalkingDot } from "@/features/company/components/talking-dot"
import type { VoiceStatus } from "@/types/round"

// A bar's resting height: a flat line, as useVoiceWaves leaves it in silence.
const FLAT = { transform: `scaleY(${FLAT_BAR})` }

/** A voice's wave; hidden, not removed, while the other voice talks, as its bars are moved. */
function Wave({
  waveRef,
  bars,
  shown,
  className,
  testId,
}: {
  waveRef: Ref<HTMLDivElement>
  bars: number
  shown: boolean
  className: string
  testId: string
}) {
  return (
    <div
      ref={waveRef}
      aria-hidden
      data-testid={testId}
      className={cn(
        "h-16 w-full items-center justify-between max-sm:h-8 max-sm:w-20",
        shown ? "flex" : "hidden"
      )}
    >
      {Array.from({ length: bars }, (_, index) => (
        <span
          key={index}
          style={FLAT}
          className={cn(
            "h-full w-1.5 rounded-full will-change-transform max-sm:w-0.5",
            className
          )}
        />
      ))}
    </div>
  )
}

/** The voice screen's one status card: Mira, labelled as AI, with a green dot while she speaks;
 * one wave, of whoever's talking; what's happening now in words, whose turn it is included; what
 * she `heard`; and a failure the service gave. On phones it's a slim strip, so the question shows
 * first. A page reloaded without a tap gets the button that turns her sound on. */
export function VoiceStatusCard({
  miraRef,
  youRef,
  status,
  picked,
  heard,
  problem,
  onSoundOn,
}: {
  // The waves' bars, moved by useVoiceWaves.
  miraRef: Ref<HTMLDivElement>
  youRef: Ref<HTMLDivElement>
  status: VoiceStatus
  // An answer is chosen and waits for a yes, or another answer.
  picked: boolean
  // The answer she understood, in words.
  heard: string | null
  problem: string | null
  onSoundOn: () => void
}) {
  const t = useTranslations("session")
  const yours = status === "listening" || status === "hearing"
  const turn = yours ? "candidate" : status === "thinking" ? "thinking" : "mira"
  const text =
    status === "listening" && picked
      ? t("voiceStatus.listeningPicked")
      : t(`voiceStatus.${status}`)

  return (
    <section
      aria-label={t("voiceInterviewer")}
      data-testid="voice-interviewer"
      data-status={status}
      className="z-10 flex flex-col gap-4 rounded-xl border bg-background p-6 max-sm:sticky max-sm:top-0 max-sm:-mx-6 max-sm:gap-1 max-sm:rounded-none max-sm:border-x-0 max-sm:px-6 max-sm:py-3 lg:sticky lg:top-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-4">
        <p className="flex items-center gap-3">
          <span className="relative font-heading text-xl font-medium normal-case max-sm:text-base">
            {t("miraName")}
            <TalkingDot talking={status === "speaking"} />
          </span>
          <span className="ms-4 rounded-full border px-3 py-0.5 text-xs text-muted-foreground">
            {t("miraLabel")}
          </span>
        </p>
        {/* Beside her name on phones, under it otherwise. */}
        <span className="block sm:basis-full">
          <Wave
            waveRef={miraRef}
            bars={MIRA_BARS}
            shown={!yours}
            className="bg-primary"
            testId="mira-wave"
          />
          <Wave
            waveRef={youRef}
            bars={YOU_BARS}
            shown={yours}
            className="bg-muted-foreground"
            testId="you-wave"
          />
        </span>
      </div>
      <div data-testid="voice-turn" data-turn={turn}>
        <p
          role="status"
          data-testid="voice-status"
          className="text-lg font-light max-sm:text-sm"
        >
          {text}
        </p>
      </div>
      {heard && (
        <p data-testid="voice-heard" className="text-sm text-muted-foreground">
          {t("voiceHeardAnswer", { answer: heard })}
        </p>
      )}
      <p
        role="status"
        // Empty, it takes no room (still there for screen readers).
        className="text-sm whitespace-pre-line text-destructive empty:sr-only"
      >
        {problem}
      </p>
      {status === "blocked" && (
        <Button className="h-12 px-6 text-base" onClick={onSoundOn}>
          <Volume2Icon aria-hidden />
          {t("voiceSoundOn")}
        </Button>
      )}
    </section>
  )
}
