"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LIST_BOX, ROW_HOVER } from "@/config/lists"
import { WARNING_TONE } from "@/config/tones"
import { RemoveButton } from "@/features/company/components/api-remove-button"
import { DotsMenu } from "@/components/common/dots-menu"
import { RollSecret } from "@/features/company/components/webhook-secret"
import { useLocalTime } from "@/hooks/use-local-time"
import { apiErrorMessage, apiFetch } from "@/lib/api"
import { bdi } from "@/lib/bidi"
import type { ApiWebhook, WebhookAttempt } from "@/types/api-access"

/** What came of a send, in words. */
function useResultText() {
  const t = useTranslations("api")

  return (result: string) => {
    if (result === "delivered" || result === "skipped") {
      return t(`results.${result}`)
    }

    // Our key can't read its secret: nothing the company can fix, and retried once it's back.
    if (result === "secret unreadable") {
      return t("results.unreadable")
    }

    // The status the endpoint answered, or what went wrong on the way.
    return /^\d{3}$/.test(result)
      ? t("results.answered", { status: result })
      : t("results.error", { error: result })
  }
}

/** How a web hook stands, as a pill; amber while it's paused. */
export function WebhookState({ hook }: { hook: ApiWebhook }) {
  const t = useTranslations("api")

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-8 px-4 text-sm font-light max-sm:order-3",
        hook.state === "paused" && WARNING_TONE
      )}
    >
      {t(`webhookStates.${hook.state}`)}
    </Badge>
  )
}

/** Sends a web hook a signed test event, and says what came of it before the button. */
export function WebhookTest({
  companyId,
  hookId,
}: {
  companyId: string
  hookId: string
}) {
  const t = useTranslations("api")
  const text = useResultText()
  const [testing, setTesting] = useState(false)
  const [answer, setAnswer] = useState<{ ok: boolean; result: string } | null>(
    null
  )

  async function test() {
    setTesting(true)

    try {
      setAnswer(
        await apiFetch(
          `/v1/manage/webhooks/${hookId}/test?company_id=${companyId}`,
          { method: "POST" }
        )
      )
    } catch (error) {
      toast.error(apiErrorMessage(error, t("testFailed")))
    } finally {
      setTesting(false)
    }
  }

  return (
    <span className="flex flex-wrap items-center justify-end gap-3">
      {answer && (
        <span
          role="status"
          data-testid="test-result"
          data-ok={answer.ok}
          className={cn(
            "text-sm",
            answer.ok ? "text-muted-foreground" : "text-destructive"
          )}
        >
          {text(answer.result)}
        </span>
      )}
      <Button
        className="h-10 px-5 text-base"
        disabled={testing}
        data-testid="webhook-test"
        onClick={test}
      >
        {t("sendTest")}
      </Button>
    </span>
  )
}

/** A web hook's "⋮" menu, for owners and admins: its delivery log (`logHref`, on its page, which
 * doesn't list it), a new signing secret, and deleting it. */
export function WebhookMenu({
  companyId,
  hook,
  logHref,
}: {
  companyId: string
  hook: ApiWebhook
  logHref?: string
}) {
  const t = useTranslations("api")
  const [rolling, setRolling] = useState(false)
  const [removing, setRemoving] = useState(false)
  const path = `/v1/manage/webhooks/${hook.id}`

  return (
    <>
      <DotsMenu
        items={[
          ...(logHref ? [{ label: t("log"), href: logHref }] : []),
          { label: t("rollSecret"), onClick: () => setRolling(true) },
          {
            label: t("removeWebhook"),
            onClick: () => setRemoving(true),
            destructive: true,
          },
        ]}
      />
      <RollSecret
        path={`${path}/secret?company_id=${companyId}`}
        asking={rolling}
        onAskingChange={setRolling}
      />
      <RemoveButton
        path={`${path}?company_id=${companyId}`}
        label={t("removeWebhook")}
        title={t("removeWebhookTitle")}
        text={t.rich("removeWebhookText", { url: hook.url, ...bdi })}
        failed={t("removeFailed")}
        opened={removing}
        onOpenedChange={setRemoving}
      />
    </>
  )
}

/** A web hook's latest sends, newest first. */
export function DeliveryLog({ attempts }: { attempts: WebhookAttempt[] }) {
  const t = useTranslations("api")
  const text = useResultText()
  const localTime = useLocalTime()

  if (attempts.length === 0) {
    return <p className="text-muted-foreground">{t("logEmpty")}</p>
  }

  return (
    <ul className={`${LIST_BOX} overflow-hidden`} data-testid="delivery-log">
      {attempts.map((attempt, index) => (
        <li
          key={index}
          className={`flex items-baseline justify-between gap-4 px-6 py-4 ${ROW_HOVER}`}
        >
          <span className="min-w-0 space-y-0.5">
            <span className="block font-mono text-sm break-all">
              {attempt.event_type}
            </span>
            <time
              suppressHydrationWarning
              className="block text-sm text-muted-foreground"
            >
              {localTime.dateTime(attempt.at)}
            </time>
          </span>
          <span
            className={cn(
              "shrink-0 text-sm",
              attempt.ok ? "text-muted-foreground" : "text-destructive"
            )}
          >
            {text(attempt.result)}
          </span>
        </li>
      ))}
    </ul>
  )
}
