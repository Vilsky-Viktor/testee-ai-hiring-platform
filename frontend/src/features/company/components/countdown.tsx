"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

import { clock, warningSeconds } from "@/lib/countdown"

function secondsUntil(end: number) {
  return Math.max(0, Math.ceil((end - Date.now()) / 1000))
}

/** Time left on a timed question; calls onExpire once when it reaches zero, or as soon as it
stops being `paused` after that.

`seconds` comes from the server as time left, not a moment, so a wrong device clock doesn't
matter. `questionSeconds` is the question's whole time, which sets when it turns red. In voice
mode the clock runs from the moment the question opens, while it's read aloud too. Render it with
a key per question, so each question starts its own clock. `frozen` keeps it at `seconds`, for a
picture of it that stands still. */
export function Countdown({
  seconds,
  questionSeconds,
  paused = false,
  frozen = false,
  onExpire,
}: {
  seconds: number
  questionSeconds: number
  paused?: boolean
  frozen?: boolean
  onExpire: () => void
}) {
  const t = useTranslations("company")
  const [end] = useState(() => Date.now() + seconds * 1000)
  const [left, setLeft] = useState(() => secondsUntil(end))
  const expired = useRef(false)

  useEffect(() => {
    if (frozen) {
      return
    }

    // Recomputed from the end every tick, so a slow tab never drifts.
    const timer = window.setInterval(() => setLeft(secondsUntil(end)), 250)

    return () => window.clearInterval(timer)
  }, [end, frozen])

  useEffect(() => {
    if (left === 0 && !paused && !expired.current) {
      expired.current = true
      onExpire()
    }
  }, [left, paused, onExpire])

  // role="timer" is read only when asked; the last seconds are announced once, on reaching
  // them, not every second.
  const warningAt = warningSeconds(questionSeconds)
  const warning = left > 0 && left <= warningAt

  return (
    <>
      <span aria-live="polite" className="sr-only">
        {warning && t("timeLeft", { time: clock(warningAt) })}
      </span>
      <span
        role="timer"
        aria-label={t("timeLeft", { time: clock(left) })}
        data-warning={warning || undefined}
        className={cn(
          "relative flex size-16 shrink-0 items-center justify-center text-primary max-sm:size-14",
          warning && "text-red-600 dark:text-red-400"
        )}
      >
        {/* A ring emptying as the time runs out. */}
        <svg
          aria-hidden
          viewBox="0 0 36 36"
          className="absolute inset-0 -rotate-90"
        >
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            strokeWidth="2.5"
            className="stroke-surface"
          />
          <circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray="100"
            strokeDashoffset={100 - (left / questionSeconds) * 100}
            className="transition-[stroke-dashoffset] duration-300 ease-linear motion-reduce:transition-none"
          />
        </svg>
        <span
          className={cn(
            "text-sm font-medium text-foreground tabular-nums",
            warning && "text-red-600 dark:text-red-400"
          )}
        >
          {clock(left)}
        </span>
      </span>
    </>
  )
}
