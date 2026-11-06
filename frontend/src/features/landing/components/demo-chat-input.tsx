import { cn } from "cn"
import { ArrowUpIcon, LoaderCircleIcon, MicIcon } from "lucide-react"
import type { Ref } from "react"

import { DEMO_PRESSED } from "@/features/landing/components/demo-panel"
import { Caret } from "@/components/common/caret"
import { VoiceBars } from "@/components/common/voice-bars"
import { buttonVariants } from "@/components/ui/button"

/** The assistant's chat input (features/assistant/components/chat-input.tsx) as a small
 * picture: `text` as typed so far (the `placeholder` while null), with a caret and the site's
 * focus line while `typing`; one button at its end: the voice button's microphone (`micRef`),
 * filled while held (`listening`), the voice's wave in the field meanwhile (`waveRef`, moved by
 * useVoiceWaves), and a spinner while what was said is turned into text (`transcribing`), as the
 * real voice button (features/assistant/components/voice-button.tsx); or, with text, the send
 * button (`sendRef`), pressed in while `pressed`. */
export function DemoChatInput({
  ref,
  sendRef,
  micRef,
  waveRef,
  listening = false,
  transcribing = false,
  text,
  typing,
  placeholder,
  pressed,
}: {
  ref?: React.Ref<HTMLDivElement>
  sendRef?: React.Ref<HTMLSpanElement>
  micRef?: Ref<HTMLSpanElement>
  waveRef?: Ref<HTMLSpanElement>
  listening?: boolean
  transcribing?: boolean
  text: string | null
  typing: boolean
  placeholder: string
  pressed: boolean
}) {
  const sending = Boolean(text) && !listening && !transcribing

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex min-h-14 items-center gap-2 rounded-xl border border-transparent bg-surface ps-5 pe-2 transition-colors",
        typing && "border-ring-gradient"
      )}
    >
      {/* One line's height whatever it holds, so the caret never moves the text. */}
      <span className="flex h-6 min-w-0 flex-1 items-center text-base">
        {/* The voice's wave, there from the start so useVoiceWaves finds its bars; shown
            while the microphone is held, the text's place taken. */}
        <VoiceBars waveRef={waveRef} shown={listening} />
        {listening ? null : text === null ? (
          <span className="truncate text-muted-foreground">{placeholder}</span>
        ) : (
          <>
            <span className="truncate">{text}</span>
            {typing && <Caret />}
          </>
        )}
      </span>
      {/* The voice button, as the real input has it before send. */}
      <span
        ref={micRef}
        className={
          sending
            ? "hidden"
            : listening
              ? // Held: the site's primary button, as the real one turns.
                buttonVariants({
                  size: "icon",
                  className: "size-10 shrink-0 rounded-full",
                })
              : "flex size-10 shrink-0 items-center justify-center rounded-full text-foreground"
        }
      >
        {transcribing ? (
          <LoaderCircleIcon className="size-5 animate-spin" />
        ) : (
          <MicIcon className="size-5" />
        )}
      </span>
      {sending && (
        <span
          ref={sendRef}
          className={buttonVariants({
            size: "icon",
            className: cn(
              "size-10 shrink-0 rounded-lg",
              pressed && DEMO_PRESSED
            ),
          })}
        >
          <ArrowUpIcon className="size-5" />
        </span>
      )}
    </div>
  )
}
