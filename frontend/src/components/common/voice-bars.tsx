import { cn } from "cn"
import type { Ref } from "react"

import { FLAT_BAR, YOU_BARS } from "@/config/voice"

// A bar at rest: a flat line, as useVoiceWaves leaves it in silence.
const FLAT = { transform: `scaleY(${FLAT_BAR})` }

/** A voice's wave as a row of grey bars, flat until useVoiceWaves moves them through `waveRef`
 * (the assistant's voice button while held, and its picture on the landing). Kept in the page
 * while hidden (`shown`), so the moving hook finds its bars from the start. */
export function VoiceBars({
  waveRef,
  shown,
  className,
}: {
  waveRef?: Ref<HTMLSpanElement>
  shown: boolean
  className?: string
}) {
  return (
    <span
      ref={waveRef}
      aria-hidden
      className={cn(
        "h-11 w-full max-w-64 shrink-0 items-center justify-between",
        shown ? "flex" : "hidden",
        className
      )}
    >
      {Array.from({ length: YOU_BARS }, (_, index) => (
        <span
          key={index}
          style={FLAT}
          className="h-full w-1 rounded-full bg-muted-foreground will-change-transform"
        />
      ))}
    </span>
  )
}
