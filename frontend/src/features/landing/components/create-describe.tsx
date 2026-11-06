"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"

import { DemoDescription } from "@/features/landing/components/demo-description"
import { DemoCompanyScreen } from "@/features/landing/components/demo-company-screen"
import { DEMO_COMPANY } from "@/config/create-demo"
import { CHOOSING, PASTED, STEPS } from "@/config/create-demo-steps"
import { useDemoContent } from "@/features/landing/hooks/use-demo-content"
import { countedAt } from "@/hooks/use-demo-steps"

// The steps the paste menu is open for.
const MENU = ["menu", "aimPaste", "paste"]
// The steps the box is focused for: clicked into, until the description is sent.
const FOCUSED = [...MENU, "pasted", "aim", "send"]
// A slide: in its place, or moved aside, faded and hidden.
const SLIDE =
  "flex min-w-0 items-center justify-center transition-[opacity,translate,visibility] duration-600 ease-[cubic-bezier(0.22,1,0.36,1)]"

/** The create demo's first screen at step `at`: the home page's start box (components/common/
 * start-test.tsx) in the middle, the description pasted into it and sent; then, sliding in, the
 * screen that asks which company it's for, a new one picked, named and continued. */
export function CreateDescribe({ at }: { at: { index: number; n: number } }) {
  const start = useTranslations("start")
  const menu = useTranslations("landing.create.menu")
  const { description } = useDemoContent("create")
  const step = STEPS[at.index].name
  const choosing = at.index >= CHOOSING

  // Two slides in one place: the box, then, once it's sent, the company's screen sliding in from
  // the end side as the box slides away to the start.
  return (
    <div className="grid flex-1 grid-cols-[minmax(0,1fr)] *:[grid-area:1/1]">
      <div
        className={cn(
          SLIDE,
          choosing && "invisible -translate-x-24 opacity-0 rtl:translate-x-24"
        )}
      >
        {/* The box floats gently until the description is sent. */}
        <div
          data-float={!choosing || undefined}
          className={cn(
            "relative flex h-80 w-full max-w-3xl rounded-xl bg-surface",
            FOCUSED.includes(step) && "border-ring-gradient"
          )}
        >
          <DemoDescription
            text={description}
            pasted={at.index >= PASTED}
            menu={MENU.includes(step)}
            pasting={step === "paste"}
            pressed={step === "send"}
            placeholder={start("placeholder")}
            labels={{ paste: menu("paste"), submit: start("submit") }}
          />
        </div>
      </div>
      <div
        className={cn(
          SLIDE,
          !choosing && "invisible translate-x-24 opacity-0 rtl:-translate-x-24"
        )}
      >
        <DemoCompanyScreen
          open={choosing}
          name={DEMO_COMPANY.slice(
            0,
            countedAt(STEPS, at, "naming", DEMO_COMPANY.length)
          )}
          typing={["focusName", "naming"].includes(step)}
          pressed={step === "continue"}
        />
      </div>
    </div>
  )
}
