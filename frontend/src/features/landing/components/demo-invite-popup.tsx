"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"
import { useId } from "react"

import { OUTLINE_BUTTON } from "@/components/common/more-link"
import { TabNav } from "@/components/common/tab-nav"
import { INVITE_TAB_ICONS } from "@/features/company/components/invite-tab-icons"
import { DemoPopup } from "@/features/landing/components/demo-popup"
import { DEMO_PRESSED } from "@/features/landing/components/demo-panel"
import { buttonVariants } from "@/components/ui/button"
import { FloatingInput } from "@/components/ui/floating-field"
import { DEMO_INVITE_NAME } from "@/config/create-demo"
import { INVITE_TABS } from "@/config/invites"

const NOTHING = () => {}

/** The invite dialog (features/company/components/invite-candidate.tsx), simplified for the
 * promo, over the whole frame while `open`: its title and tabs, the candidate's email (`email` as typed so far, its
 * field in use while `typing`; the pointer's "email") and name (`name` so far, in use while
 * `naming`; "inviteName"), sliding in one after the other, then invite (the pointer's
 * "sendInvite"), pressed in while `pressed`. */
export function DemoInvitePopup({
  open,
  email,
  typing,
  name,
  naming,
  pressed,
}: {
  open: boolean
  email: string
  typing: boolean
  name: string
  naming: boolean
  pressed: boolean
}) {
  const t = useTranslations("interviews")
  const common = useTranslations("common")
  const panel = useId()

  return (
    <DemoPopup open={open}>
      <p className="font-heading text-xl leading-none font-medium lowercase">
        {t("inviteTitle")}
      </p>
      <TabNav
        items={INVITE_TABS.map((id) => ({
          id,
          label: t(`inviteTab.${id}`),
          icon: INVITE_TAB_ICONS[id],
        }))}
        current="one"
        onSelect={NOTHING}
        panel={panel}
      />
      {/* Each field wrapped, so its light and bump don't replay its entrance. */}
      <div data-stagger className="space-y-6">
        <span className="block">
          <span data-demo-target="email" className="relative block">
            <FloatingInput
              label={t("candidateEmail")}
              placeholder="candidate@example.com"
              value={email}
              readOnly
              caret={typing}
              boxClassName={cn(typing && "border-ring-gradient")}
            />
          </span>
        </span>
        <span className="block">
          <span data-demo-target="inviteName" className="relative block">
            <FloatingInput
              label={t("candidateName")}
              placeholder={DEMO_INVITE_NAME}
              value={name}
              readOnly
              caret={naming}
              boxClassName={cn(naming && "border-ring-gradient")}
            />
          </span>
        </span>
      </div>
      <div className="flex justify-end gap-2">
        <span
          className={buttonVariants({
            variant: "outline",
            className: cn(
              OUTLINE_BUTTON,
              "h-10 border-foreground/20! px-5 text-base dark:border-input!"
            ),
          })}
        >
          {common("cancel")}
        </span>
        <span
          data-demo-target="sendInvite"
          className={buttonVariants({
            className: cn(
              "h-10 px-5 text-base transition-opacity",
              !email && "opacity-50",
              pressed && DEMO_PRESSED
            ),
          })}
        >
          {t("invite")}
        </span>
      </div>
    </DemoPopup>
  )
}
