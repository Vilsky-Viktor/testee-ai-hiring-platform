"use client"

import { cn } from "cn"
import { InboxIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { DemoInviteEmail } from "@/features/landing/components/demo-invite-email"
import {
  DEMO_PRESSED,
  PROMO_POP,
} from "@/features/landing/components/demo-panel"
import { DEMO_COMPANY } from "@/config/create-demo"
import { INBOX, OPENED, STEPS } from "@/config/create-demo-steps"

// The invitation arriving: dropping in at the top of the list, then washed in the primary colour.
const DROP =
  "motion-safe:animate-[promo-drop_0.6s_cubic-bezier(0.2,0.9,0.3,1.2)_both,promo-flash_1.8s_ease-out_0.4s]"
// Earlier emails, as grey lines: only the invitation is read.
const OLDER = [0, 1]

/** The create demo's last screen at step `at`, simplified for the promo: the candidate's inbox,
 * a mail app's bare list in the site's theme, the invitation dropping in at its top, the unread
 * count popping; then, opened, the email itself rising into view (DemoInviteEmail), floating
 * gently, its button clicked. */
export function CreateEmail({ at }: { at: { index: number; n: number } }) {
  const t = useTranslations("landing.create.email")
  const step = STEPS[at.index].name
  const arrived = at.index >= INBOX
  const opened = at.index >= OPENED

  return (
    <div className="mx-auto grid min-h-0 w-full max-w-3xl flex-1 grid-cols-[minmax(0,1fr)] *:[grid-area:1/1]">
      <div
        className={cn(
          "flex min-h-0 flex-col justify-center gap-4 transition-opacity duration-300",
          opened && "invisible opacity-0"
        )}
      >
        <p className="flex items-center gap-3 px-1 font-heading text-2xl font-medium">
          <InboxIcon className="size-6" />
          {t("inbox")}
          {arrived && (
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground",
                PROMO_POP
              )}
            >
              1
            </span>
          )}
        </p>
        <ul className="divide-y rounded-xl border text-base">
          {arrived && (
            // The row drops in; what's inside is the pointer's, so its glow and bump don't
            // replay the drop.
            <li className={cn("rounded-t-xl", DROP)}>
              <span
                data-demo-target="mail"
                className={cn(
                  "flex items-center gap-4 rounded-t-xl px-4 py-4",
                  step === "openMail" && DEMO_PRESSED
                )}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-foreground font-semibold text-background">
                  t
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{t("from")}</span>
                  <span className="block truncate">
                    {t("subject", { company: DEMO_COMPANY })}
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold">
                  {t("now")}
                </span>
              </span>
            </li>
          )}
          {OLDER.map((row) => (
            <li key={row} className="flex items-center gap-4 px-4 py-4">
              <span className="size-10 shrink-0 rounded-full bg-surface" />
              <span className="flex flex-1 flex-col gap-2">
                <span className="h-2.5 w-24 rounded-full bg-surface" />
                <span className="h-2.5 w-2/3 rounded-full bg-surface" />
              </span>
            </li>
          ))}
        </ul>
      </div>
      {opened && (
        <div className="flex min-h-0 items-center justify-center motion-safe:animate-[promo-fly-up_0.6s_cubic-bezier(0.2,0.9,0.3,1.2)_both]">
          <div data-float className="w-full">
            <DemoInviteEmail pressed={step === "openInvite"} />
          </div>
        </div>
      )}
    </div>
  )
}
