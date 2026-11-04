"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"

import { DEMO_PRESSED } from "@/features/landing/components/demo-panel"
import { VoiceAccessStep } from "@/features/company/components/voice-access-step"
import { Checkbox } from "@/components/ui/checkbox"
import { buttonVariants } from "@/components/ui/button"
import { START_BUTTON } from "@/config/start-page"
import type { VoiceAccess } from "@/hooks/use-voice-access"

const NOTHING = () => {}

/** The start page's start (features/company/components/start-pledge.tsx), for the landing: by
 * voice the real microphone step first (`access`), then the pledge, ticked once `pledged`, and
 * the start button, dimmed until it works and pressed in while `pressed`. With motion allowed,
 * the microphone's step pops in once access is granted, and the pledge bumps as it's ticked
 * (promo-pop, promo-tick: animations.css). */
export function DemoStartAction({
  access,
  pledged,
  pressed,
}: {
  // Null in click mode.
  access: VoiceAccess | null
  pledged: boolean
  pressed: boolean
}) {
  const t = useTranslations("invite")
  const ready = pledged && (access === null || access === "granted")

  return (
    <div className="space-y-5">
      {access && (
        <div
          key={access === "granted" ? "granted" : "ask"}
          data-demo-target="access"
          className={cn(
            access === "granted" &&
              "motion-safe:animate-[promo-pop_0.5s_cubic-bezier(0.2,0.9,0.3,1.2)_both]"
          )}
        >
          <VoiceAccessStep access={access} onAllow={NOTHING} />
        </div>
      )}
      <span className="mx-auto flex w-fit items-center gap-3 text-start text-sm">
        <span
          data-demo-target="pledge"
          className="flex motion-safe:*:data-checked:animate-[promo-tick_0.4s_ease-out]"
        >
          <Checkbox
            className="size-5 shrink-0 [&_[data-slot=checkbox-indicator]>svg]:size-3.5"
            checked={pledged}
          />
        </span>
        {t("pledge")}
      </span>
      <span
        data-demo-target="start"
        className={buttonVariants({
          className: cn(
            START_BUTTON,
            "transition-opacity",
            !ready && "opacity-50",
            pressed && DEMO_PRESSED
          ),
        })}
      >
        {t("start")}
      </span>
    </div>
  )
}
