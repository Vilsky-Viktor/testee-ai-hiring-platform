"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"

import { DEMO_PRESSED } from "@/features/landing/components/demo-panel"
import {
  DEMO_COMPANY,
  DEMO_INTERVIEW,
  DEMO_INVITE_EMAIL,
} from "@/config/create-demo"
import { OPERATOR } from "@/config/operator"
import { bdi } from "@/lib/bidi"

// The invite's address, as the email shows it under its button.
const INVITE_LINK = "https://testee.ai/invite/x8Kf2mQ9pL"

/** The invitation email exactly as testee sends it (the notifications service's
 * templates/layout.py and the "candidate" texts): its own light colours whatever the site's theme,
 * as mail clients show it; testee's name, the white card with the heading and its blue dot, who
 * invited them to what, the address to sign in with, the button (`pressed`, the pointer's
 * `openInvite`), the link to paste, and the footer. */
export function DemoInviteEmail({ pressed }: { pressed: boolean }) {
  const t = useTranslations("landing.create.email")
  const values = {
    company: DEMO_COMPANY,
    title: DEMO_INTERVIEW.title,
    email: DEMO_INVITE_EMAIL,
  }

  return (
    <div
      data-testid="demo-invite-email"
      className="bg-[#f5f5f5] px-4 py-8 text-start text-[#0a0a0a]"
    >
      <div className="mx-auto max-w-[560px]">
        <p
          dir="ltr"
          className="px-2 pb-6 font-heading text-[26px] leading-8 font-semibold tracking-[-0.5px]"
        >
          testee<span className="text-[#0071e0]">.</span>
        </p>
        <div className="rounded-2xl border border-[#e5e5e5] bg-white px-8 py-10">
          <p className="mb-6 text-2xl leading-8 font-semibold">
            {t("heading")}
            <span className="text-[#0071e0]">.</span>
          </p>
          <p className="mb-4 text-base leading-6 text-[#404040]">
            {t.rich("invited", {
              ...values,
              ...bdi,
              b: (chunks) => (
                <strong className="font-semibold text-[#0a0a0a]">
                  {chunks}
                </strong>
              ),
            })}
          </p>
          <p className="mb-4 text-base leading-6 text-[#404040]">
            {t.rich("signIn", { ...values, ...bdi })}
          </p>
          <span
            data-demo-target="openInvite"
            className={cn(
              "mt-2 mb-8 inline-block rounded-[10px] bg-[#0071e0] px-7 py-3.5 text-base leading-5 font-semibold text-white transition-transform",
              pressed && DEMO_PRESSED
            )}
          >
            {t("button")}
          </span>
          <p className="text-sm leading-5 text-[#737373]">
            {t("pasteLink")}
            <br />
            <span dir="ltr" className="break-all text-[#0071e0]">
              {INVITE_LINK}
            </span>
          </p>
        </div>
        <p className="px-2 pt-6 text-[13px] leading-5 text-[#6b6b6b]">
          {t.rich("footer", { ...values, ...bdi })}
          <br />
          <span className="underline">{t("stopCompany", values)}</span>
          <br />
          <br />
          {t("operator", { name: OPERATOR.name, address: OPERATOR.address })}
        </p>
      </div>
    </div>
  )
}
