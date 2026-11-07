"use client"

import { cn } from "cn"
import { ArrowRightIcon, CheckIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { LocalizedLink } from "@/components/common/localized-link"
import { Button, buttonVariants } from "@/components/ui/button"
import { previewValue } from "@/lib/action-values"
import { linkPage } from "@/lib/assistant"
import { bdi } from "@/lib/bidi"
import { hasMessage } from "@/lib/messages"
import type { AssistantBlock } from "@/types/assistant"
import { CARD } from "@/config/cards"

export type CardActions = {
  onConfirm: (actionId: string) => void
  onCancel: (actionId: string) => void
  // While an answer streams, nothing can be confirmed.
  busy: boolean
  companyNames: Record<string, string>
}

/** An action the assistant prepared: what will happen, with exactly the values it runs with
 * (and a warning when it can't be undone), a large Confirm and a quiet Cancel; once done or
 * cancelled, one line with how it ended and the page it made. */
export function ActionCard({
  card,
  actions,
  onNavigate,
}: {
  card: AssistantBlock
  actions: CardActions
  onNavigate: () => void
}) {
  const t = useTranslations("assistant.actions")
  const tool = card.tool ?? ""
  const title = `titles.${tool}` as const
  const state = card.state ?? "pending"
  // The company, unless the card is about it already.
  const named = card.company_id && actions.companyNames[card.company_id]
  const company = named !== card.subject ? named : null
  const fields = Object.entries(card.preview ?? {})
  const heading = hasMessage(t, title) ? t(title) : t("generic")

  if (state === "done" || state === "cancelled") {
    return (
      <div
        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border px-4 py-3 text-sm"
        data-testid="action-card"
      >
        <p className="min-w-0 truncate font-medium">{heading}</p>
        <ActionOutcome card={card} state={state} onNavigate={onNavigate} />
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${CARD} text-sm`} data-testid="action-card">
      <div className="space-y-0.5">
        <p className="text-base font-medium">{heading}</p>
        {card.subject && (
          <p className="bidi-auto break-words">{card.subject}</p>
        )}
      </div>
      {(company || fields.length > 0) && (
        <ActionFields tool={tool} company={company} fields={fields} />
      )}
      {state === "pending" && <ActionWarnings card={card} />}
      {(state === "pending" || state === "running") && (
        <ActionButtons card={card} actions={actions} />
      )}
      <ActionOutcome card={card} state={state} onNavigate={onNavigate} />
    </div>
  )
}

/** Before it's confirmed: the credits a removal gives back, and that it can't be undone. */
function ActionWarnings({ card }: { card: AssistantBlock }) {
  const t = useTranslations("assistant.actions")
  const companyText = useTranslations("company")

  return (
    <>
      {card.credits && (
        <p className="text-destructive">
          {companyText("removeCredits", {
            credits: card.credits.available,
            candidates: card.credits.candidates,
          })}
        </p>
      )}
      {card.destructive && <p className="text-destructive">{t("cantUndo")}</p>}
    </>
  )
}

/** The values an action runs with: its company, unless the card is about it already, and each
 * field under its name for this tool, else its general name, else its key. */
function ActionFields({
  tool,
  company,
  fields,
}: {
  tool: string
  company: string | null | undefined | false
  fields: [string, unknown][]
}) {
  const t = useTranslations("assistant.actions")
  const label = (key: string) => {
    const own = `fieldsOf.${tool}.${key}` as const
    const general = `fields.${key}` as const

    if (hasMessage(t, own)) {
      return t(own)
    }

    return hasMessage(t, general) ? t(general) : key
  }

  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
      {company && (
        <>
          <dt className="text-muted-foreground">{t("fields.company")}</dt>
          <dd className="bidi-auto break-words">{company}</dd>
        </>
      )}
      {fields.map(([key, value]) => (
        <div key={key} className="contents">
          <dt className="text-muted-foreground">{label(key)}</dt>
          <dd className="bidi-auto break-words whitespace-pre-wrap">
            {previewValue(key, value, t("yes"), t("no"))}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/** Confirm and Cancel; neither while it runs or an answer streams. */
function ActionButtons({
  card,
  actions,
}: {
  card: AssistantBlock
  actions: CardActions
}) {
  const t = useTranslations("assistant.actions")
  const running = card.state === "running"

  return (
    <div className="flex gap-2">
      <Button
        variant={card.destructive ? "destructive" : "default"}
        className="h-11 flex-1 px-4 text-base"
        disabled={running || actions.busy}
        onClick={() => actions.onConfirm(card.action_id!)}
      >
        {running ? t("running") : t("confirm")}
      </Button>
      <Button
        variant="ghost"
        className="h-11 px-4 text-base hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
        disabled={running || actions.busy}
        onClick={() => actions.onCancel(card.action_id!)}
      >
        {t("cancel")}
      </Button>
    </div>
  )
}

/** How an action ended: done, with the pages it made; failed, with why and the page that sorts
 * it out, if one does; or cancelled. Nothing while it's pending or running. */
function ActionOutcome({
  card,
  state,
  onNavigate,
}: {
  card: AssistantBlock
  state: string
  onNavigate: () => void
}) {
  const t = useTranslations("assistant.actions")

  if (state === "failed") {
    return (
      <div className="space-y-3">
        <p className="text-destructive">{card.detail ?? t("failed")}</p>
        <ActionLinks card={card} onNavigate={onNavigate} />
      </div>
    )
  }

  if (state === "cancelled") {
    return <p className="text-muted-foreground">{t("cancelled")}</p>
  }

  if (state !== "done") {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <CheckIcon aria-hidden className="size-4" />
        {t("done")}
      </span>
      <ActionLinks card={card} onNavigate={onNavigate} />
    </div>
  )
}

/** An action's pages, by the name it made, else the page's name, else "Open". */
function ActionLinks({
  card,
  onNavigate,
}: {
  card: AssistantBlock
  onNavigate: () => void
}) {
  const t = useTranslations("assistant.actions")
  const pages = useTranslations("assistant.pages")

  return card.links.map(
    (href) =>
      href && (
        <LocalizedLink
          key={href}
          href={href}
          onClick={onNavigate}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            // A name keeps its capitals in the lowercase button.
            card.result_label && "normal-case"
          )}
        >
          {card.result_label
            ? t.rich("openNamed", { name: card.result_label, ...bdi })
            : pages(linkPage(href) ?? "open")}
          <ArrowRightIcon data-icon="inline-end" className="rtl:-scale-x-100" />
        </LocalizedLink>
      )
  )
}
