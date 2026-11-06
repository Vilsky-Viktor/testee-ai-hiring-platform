"use client"

import { cn } from "cn"
import { EllipsisVerticalIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { DEMO_PRESSED } from "@/features/landing/components/demo-panel"
import { CHAT_APPS } from "@/components/common/chat-apps"
import { PRIMARY_FILL } from "@/config/buttons"
import { OUTLINE_BUTTON } from "@/components/common/more-link"
import {
  DemoEmailField,
  DemoPopup,
} from "@/features/landing/components/demo-popup"
import { buttonVariants } from "@/components/ui/button"

/** A report's "⋮" menu (components/common/dots-menu.tsx) for the landing, the pointer's "dots":
 * while `menu`, open with its two items, downloading its PDF and sharing it (the pointer's
 * "download" and "share"): grey as the pointer heads for one (`aimed`), blue as it's `pressed`. */
export function DemoReportActions({
  menu,
  aimed = null,
  pressed,
}: {
  menu: boolean
  aimed?: "download" | "share" | null
  pressed: "download" | "share" | null
}) {
  const t = useTranslations("report")
  const item = (name: "download" | "share", label: string) => (
    <span
      data-demo-target={name}
      className={cn(
        "block rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors",
        aimed === name && "bg-surface",
        pressed === name && `${PRIMARY_FILL} ${DEMO_PRESSED}`
      )}
    >
      {label}
    </span>
  )

  return (
    <span className="relative shrink-0">
      <span
        data-demo-target="dots"
        className={buttonVariants({
          variant: "ghost",
          size: "icon",
          className: cn(
            "size-10 rounded-xl bg-surface text-muted-foreground",
            menu && "bg-input"
          ),
        })}
      >
        <EllipsisVerticalIcon className="size-5" />
      </span>
      {menu && (
        <span className="absolute end-0 top-full z-10 mt-1 block rounded-xl bg-popover p-1 shadow-md ring-1 ring-foreground/10">
          {item("download", t("download"))}
          {item("share", t("share"))}
        </span>
      )}
    </span>
  )
}

/** The share popup, small, over the whole panel while `open`: its title, the recipient's email
 * (`email` as typed so far, a caret while `typing`) with "send PDF" inside it, then the chat apps
 * that get a text summary and cancel (the pointer's "email", "send" and "whatsApp"). `pressed`
 * names what's being clicked. */
export function DemoSharePopup({
  open,
  email,
  typing,
  pressed,
}: {
  open: boolean
  email: string
  typing: boolean
  pressed: "send" | "whatsApp" | null
}) {
  const t = useTranslations("report")
  const common = useTranslations("common")

  return (
    <DemoPopup open={open}>
      <p className="font-heading text-xl leading-none font-medium lowercase">
        {t("shareTitle")}
      </p>
      <span className="relative block">
        <DemoEmailField
          target="email"
          email={email}
          typing={typing}
          placeholder="manager@example.com"
        />
        {/* Placed by its wrapper: pressing it replaces its own translate. */}
        <span className="absolute inset-y-0 end-1.5 flex items-center">
          <span
            data-demo-target="send"
            className={buttonVariants({
              className: cn(
                "h-9 rounded-lg px-3 text-sm transition-opacity",
                !email && "opacity-50",
                pressed === "send" && DEMO_PRESSED
              ),
            })}
          >
            <span>
              {t.rich("send", {
                name: (chunks) => <span className="normal-case">{chunks}</span>,
              })}
            </span>
          </span>
        </span>
      </span>
      <div className="space-y-2">
        <p className="text-center text-sm text-muted-foreground">
          {t("orSummary")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {CHAT_APPS.map(({ name, Icon }, index) => (
            <span
              key={name}
              data-demo-target={index === 0 ? "whatsApp" : undefined}
              className={buttonVariants({
                variant: "outline",
                className: cn(
                  OUTLINE_BUTTON,
                  "h-10 gap-2 border-foreground/20! px-2 text-sm normal-case dark:border-input!",
                  index === 0 && pressed === "whatsApp" && DEMO_PRESSED
                ),
              })}
            >
              <Icon className="size-5" />
              {name}
            </span>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <span
          className={buttonVariants({
            variant: "outline",
            className: cn(
              OUTLINE_BUTTON,
              "h-9 border-foreground/20! px-4 text-base dark:border-input!"
            ),
          })}
        >
          {common("cancel")}
        </span>
      </div>
    </DemoPopup>
  )
}
