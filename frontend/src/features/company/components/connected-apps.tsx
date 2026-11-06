"use client"

import { cn } from "cn"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { useLocalTime } from "@/hooks/use-local-time"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { AI_APP_LOGOS } from "@/config/ai-apps"
import { Dot } from "@/components/common/dot"
import { INTEGRATION_LOGO, LIST_BOX, ROW_HOVER } from "@/config/lists"
import { DotsMenu } from "@/components/common/dots-menu"
import { apiErrorMessage, apiFetch } from "@/lib/api"
import { bdi } from "@/lib/bidi"
import { firstGrapheme } from "@/lib/graphemes"
import type { AiConnection } from "@/types/connections"

/** The AI apps the user connected to their account, in one list like the API keys: each with its
 * logo or first letter, name, when it was last used and where it runs, and a "⋮" menu to disconnect it. */
export function ConnectedApps({
  connections,
}: {
  connections: AiConnection[]
}) {
  const t = useTranslations("aiApps")

  return (
    <section className="space-y-4" data-testid="connected-apps">
      <h2 className="font-heading text-2xl font-medium">
        {t("connectedTitle")}
      </h2>
      <ul className={LIST_BOX}>
        {connections.map((app) => (
          <ConnectedApp key={app.id} app={app} />
        ))}
      </ul>
    </section>
  )
}

function ConnectedApp({ app }: { app: AiConnection }) {
  const t = useTranslations("aiApps")
  const ats = useTranslations("ats")
  const localTime = useLocalTime()
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const logo = AI_APP_LOGOS.find(({ name }) => name.test(app.client_name))

  async function disconnect() {
    setBusy(true)

    try {
      await apiFetch(`/assistant/connections/${app.id}`, { method: "DELETE" })
      setConfirming(false)
      router.refresh()
    } catch (error) {
      toast.error(apiErrorMessage(error, t("disconnectFailed")))
    } finally {
      setBusy(false)
    }
  }

  return (
    <li
      className={`group/row flex items-center gap-4 py-6 pe-6 max-sm:ps-6 ${ROW_HOVER}`}
    >
      {/* Its own logo, or its first letter; the row's full height, from its start edge. */}
      <span aria-hidden className={INTEGRATION_LOGO}>
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo.logo}
            alt=""
            className={cn(
              "size-10 object-contain max-sm:size-7",
              logo.mono && "dark:invert"
            )}
          />
        ) : (
          <span className="font-heading text-2xl font-medium text-muted-foreground uppercase">
            {firstGrapheme(app.client_name)}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1 space-y-1">
        <span className="block text-lg font-medium break-all">
          {app.client_name}
        </span>
        <span className="block text-sm text-muted-foreground">
          {app.last_used_at
            ? t.rich("lastUsed", localTime.dateValues(app.last_used_at))
            : t("neverUsed")}
          <Dot />
          {app.redirect_host}
        </span>
      </span>
      <DotsMenu
        items={[
          {
            label: ats("disconnect"),
            onClick: () => setConfirming(true),
            destructive: true,
          },
        ]}
      />
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t.rich("disconnectTitle", { client: app.client_name, ...bdi })}
        text={t.rich("disconnectText", { client: app.client_name, ...bdi })}
        confirm={ats("disconnect")}
        busy={busy}
        onConfirm={disconnect}
      />
    </li>
  )
}
