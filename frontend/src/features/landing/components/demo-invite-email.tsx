"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"

import { DemoLogo } from "@/features/landing/components/demo-logo"
import { DEMO_PRESSED } from "@/features/landing/components/demo-panel"
import { useDemoContent } from "@/features/landing/hooks/use-demo-content"
import { DEMO_COMPANY, DEMO_INVITE_EMAIL } from "@/config/create-demo"
import { bdi } from "@/lib/bidi"

/** The invitation email as testee sends it (the notifications service's
 * templates/layout.py and the "candidate" texts): its own light colours whatever the site's theme,
 * as mail clients show it; testee's name, the white card with the heading and its blue dot beside
 * the company's logo (Acme's, DemoLogo), who
 * invited them to what, the address to sign in with and the button (`pressed`, the pointer's
 * `openInvite`); simplified for the promo, without the link to paste and the footer. */
export function DemoInviteEmail({ pressed }: { pressed: boolean }) {
  const t = useTranslations("landing.create.email")
  const { title } = useDemoContent("create")
  const values = {
    company: DEMO_COMPANY,
    title,
    email: DEMO_INVITE_EMAIL,
  }

  return (
    <div
      data-testid="demo-invite-email"
      className="rounded-xl bg-[#f5f5f5] px-4 py-6 text-start text-[#0a0a0a]"
    >
      <div className="mx-auto max-w-[560px]">
        <p
          dir="ltr"
          className="px-2 pb-4 font-heading text-[26px] leading-8 font-semibold tracking-[-0.5px]"
        >
          testee<span className="text-[#0071e0]">.</span>
        </p>
        <div className="rounded-2xl border border-[#e5e5e5] bg-white px-8 py-7">
          {/* The heading, and the company's logo at the row's end (the template's HTML_LOGO). */}
          <div className="mb-5 flex items-center justify-between gap-4">
            <p className="text-2xl leading-8 font-semibold">
              {t("heading")}
              <span className="text-[#0071e0]">.</span>
            </p>
            <DemoLogo className="size-16" />
          </div>
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
              "mt-2 inline-block rounded-[10px] bg-[#0071e0] px-7 py-3.5 text-base leading-5 font-semibold text-white transition-transform",
              pressed && DEMO_PRESSED
            )}
          >
            {t("button")}
          </span>
        </div>
      </div>
    </div>
  )
}
