import { cn } from "cn"
import { ArrowRightIcon, CheckIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { DEMO_PRESSED } from "@/features/landing/components/demo-panel"
import { buttonVariants } from "@/components/ui/button"
import { ASK_AGENT_EMAIL } from "@/config/ask-agent-demo"
import { useDemoContent } from "@/features/landing/hooks/use-demo-content"
import { CARD } from "@/config/cards"

export type DemoCardState = "pending" | "running" | "done"

/** The card the assistant shows before it invites a candidate (features/assistant/components/
 * action-card.tsx) as a small picture: what it will do, with the email, Confirm (`confirmRef`,
 * pressed in while `pressed`) and Cancel; then one line, Done, with the candidates' page. */
export function DemoActionCard({
  state,
  confirmRef,
  pressed,
}: {
  state: DemoCardState
  confirmRef: React.Ref<HTMLSpanElement>
  pressed: boolean
}) {
  const t = useTranslations("assistant.actions")
  const pages = useTranslations("assistant.pages")
  const { interview } = useDemoContent("askAgent")

  // Popping in as it comes, with motion allowed (the "just ask" promo).
  const pop =
    "motion-safe:animate-[promo-pop_0.5s_cubic-bezier(0.2,0.9,0.3,1.2)_both]"

  if (state === "done") {
    return (
      <li
        className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border px-4 py-3 text-sm ${pop}`}
      >
        <p className="min-w-0 truncate font-medium">
          {t("titles.invite_candidate")}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CheckIcon className="size-4" />
            {t("done")}
          </span>
          <span className={buttonVariants({ variant: "outline", size: "sm" })}>
            {pages("candidates")}
            <ArrowRightIcon
              data-icon="inline-end"
              className="rtl:-scale-x-100"
            />
          </span>
        </div>
      </li>
    )
  }

  return (
    <li className={`space-y-4 ${CARD} text-sm ${pop}`}>
      <div className="space-y-0.5">
        <p className="text-base font-medium">{t("titles.invite_candidate")}</p>
        <p>{interview}</p>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
        <dt className="text-muted-foreground">{t("fields.email")}</dt>
        <dd className="break-words">{ASK_AGENT_EMAIL}</dd>
      </dl>
      <div className="flex gap-2">
        <span
          ref={confirmRef}
          className={buttonVariants({
            className: cn(
              "h-11 flex-1 px-4 text-base",
              state === "running" && "opacity-50",
              pressed && DEMO_PRESSED
            ),
          })}
        >
          {state === "running" ? t("running") : t("confirm")}
        </span>
        <span
          className={buttonVariants({
            variant: "ghost",
            className: cn(
              "h-11 px-4 text-base",
              state === "running" && "opacity-50"
            ),
          })}
        >
          {t("cancel")}
        </span>
      </div>
    </li>
  )
}
