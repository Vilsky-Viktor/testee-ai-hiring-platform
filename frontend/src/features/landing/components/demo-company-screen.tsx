"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"

import { DEMO_PRESSED } from "@/features/landing/components/demo-panel"
import { buttonVariants } from "@/components/ui/button"
import { FloatingInput } from "@/components/ui/floating-field"

/** The page asking a first-time user for their company's name (app/generate/company), as a screen
 * of the promo, its parts sliding up one after another once `open`: the question, the name field
 * (`name` as typed so far, ringed while `typing`; the pointer's "name") and continue (the pointer's
 * "continue"), pressed while `pressed`. Targets sit inside wrappers, so their glow and bump never
 * replay an entrance. */
export function DemoCompanyScreen({
  open,
  name,
  typing,
  pressed,
}: {
  open: boolean
  name: string
  typing: boolean
  pressed: boolean
}) {
  const t = useTranslations("start")

  return (
    <div data-open={open} className="flex flex-1 items-center justify-center">
      <div data-stagger className="w-full max-w-xl space-y-4">
        <p className="pb-2 font-heading text-3xl font-medium tracking-tight lowercase">
          {t("firstCompany")}
        </p>
        <span className="block pt-2">
          <span data-demo-target="name" className="relative block">
            <FloatingInput
              label={t("companyName")}
              value={name}
              readOnly
              caret={typing}
              boxClassName={cn(typing && "border-ring-gradient")}
            />
          </span>
        </span>
        <span className="flex justify-center pt-2">
          <span
            data-demo-target="continue"
            className={buttonVariants({
              className: cn(
                "h-12 px-10 text-lg transition-opacity",
                !name && "opacity-50",
                pressed && DEMO_PRESSED
              ),
            })}
          >
            {t("continue")}
          </span>
        </span>
      </div>
    </div>
  )
}
