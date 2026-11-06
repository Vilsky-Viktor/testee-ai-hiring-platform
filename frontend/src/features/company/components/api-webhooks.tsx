"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"

import { CodeEditor } from "@/components/common/code-editor"
import { SubtopicList } from "@/components/common/subtopic-list"
import { InfoCard } from "@/components/common/warning-card"
import { MAX_WEBHOOK_URL, WEBHOOK_SAMPLE } from "@/config/api"
import { CARD } from "@/config/cards"
import { LIST_BOX, ROW_HOVER } from "@/config/lists"
import { CreateDialog } from "@/features/company/components/api-dialogs"
import {
  WebhookMenu,
  WebhookState,
} from "@/features/company/components/webhook-actions"
import { useLocalTime } from "@/hooks/use-local-time"
import type { ApiWebhook } from "@/types/api-access"

const EVENTS = [
  "started",
  "finished",
  "undelivered",
  "expired",
  "removed",
  "ready",
] as const

/** "Add web hook": an HTTPS address, then its signing secret, shown this once. */
export function AddWebhook({
  companyId,
  triggerClassName,
}: {
  companyId: string
  triggerClassName?: string
}) {
  const t = useTranslations("api")

  return (
    <CreateDialog
      path={`/v1/manage/webhooks?company_id=${companyId}`}
      field="url"
      type="url"
      maxLength={MAX_WEBHOOK_URL}
      label={t("addWebhook")}
      placeholder={t("webhookUrl")}
      title={t("addWebhookTitle")}
      failed={t("createFailed")}
      triggerClassName={triggerClassName}
      shown={{
        value: "secret",
        title: t("webhookCreatedTitle"),
        text: t("webhookCreatedText"),
        copy: t("copySecret"),
        copied: t("secretCopied"),
      }}
    />
  )
}

/** What web hooks hear, and how to trust it. */
function WebhooksNote() {
  const t = useTranslations("api")

  return (
    <InfoCard className="max-sm:-mx-6 max-sm:rounded-none">
      <span className="block">{t("webhooksText")}</span>
      <span className="mt-3 block">
        <SubtopicList
          subtopics={EVENTS.map((event) => t(`webhookEvents.${event}`))}
          small
        />
      </span>
    </InfoCard>
  )
}

/** A web hook's row: its address, when it last took an event or was added, how it stands, and its
 * "⋮" menu for owners and admins. The row opens its page. */
function WebhookRow({
  companyId,
  hook,
  canEdit,
}: {
  companyId: string
  hook: ApiWebhook
  canEdit: boolean
}) {
  const t = useTranslations("api")
  const localTime = useLocalTime()
  const href = `/companies/${companyId}/integrations/api/webhooks/${hook.id}`

  return (
    <li
      className={`group/row relative flex flex-wrap items-center gap-x-6 gap-y-3 p-6 ${ROW_HOVER}`}
      data-testid="webhook"
      data-state={hook.state}
    >
      <span className="min-w-0 flex-1 space-y-1 max-sm:basis-[calc(100%-4rem)]">
        <Link
          href={href}
          className="block text-lg font-medium break-all outline-none after:absolute after:inset-0 focus-visible:after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
        >
          {hook.url}
        </Link>
        <span className="block text-sm text-muted-foreground">
          {hook.last_delivered_at
            ? t.rich(
                "lastDelivered",
                localTime.dateValues(hook.last_delivered_at)
              )
            : t.rich("added", localTime.dateValues(hook.created_at))}
        </span>
      </span>
      <WebhookState hook={hook} />
      {canEdit && (
        <span className="relative z-10 flex max-sm:order-1">
          <WebhookMenu companyId={companyId} hook={hook} logHref={href} />
        </span>
      )}
    </li>
  )
}

/** The addresses that hear the company's events, paused ones first; with none yet, what one gets
 * and the way to add the first. */
export function ApiWebhooks({
  companyId,
  webhooks,
  canEdit,
}: {
  companyId: string
  webhooks: ApiWebhook[]
  canEdit: boolean
}) {
  const t = useTranslations("api")

  return (
    <div className="space-y-6">
      <WebhooksNote />
      {webhooks.length > 0 ? (
        <ul className={LIST_BOX}>
          {webhooks.map((hook) => (
            <WebhookRow
              key={hook.id}
              companyId={companyId}
              hook={hook}
              canEdit={canEdit}
            />
          ))}
        </ul>
      ) : (
        <section
          className={`mx-auto max-w-xl space-y-6 ${CARD}`}
          data-testid="no-webhooks"
        >
          <h2 className="font-heading text-2xl font-medium tracking-tight">
            {t("firstWebhookTitle")}
          </h2>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t("webhookSampleText")}
            </p>
            <CodeEditor code={WEBHOOK_SAMPLE} language="json" />
          </div>
          {canEdit && (
            <AddWebhook
              companyId={companyId}
              triggerClassName="h-14 w-full text-lg"
            />
          )}
        </section>
      )}
    </div>
  )
}
