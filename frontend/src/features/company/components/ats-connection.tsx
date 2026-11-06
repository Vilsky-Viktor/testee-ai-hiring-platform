"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { CandidateFlow } from "@/features/company/components/ats-candidate-flow"
import { ConnectAts } from "@/features/company/components/ats-connect"
import { AtsWebhook } from "@/features/company/components/ats-webhook"
import { ConnectionMenu } from "@/components/common/dots-menu"
import {
  IntegrationRow,
  NeedsReconnecting,
} from "@/features/company/components/integration-row"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Badge } from "@/components/ui/badge"
import { WEBHOOKS, type AtsProvider } from "@/config/ats"
import { INTEGRATION_ACTIONS } from "@/config/lists"
import { apiErrorMessage, apiFetch } from "@/lib/api"
import type { AtsConnection } from "@/types/company"

/** An ATS's row on the integrations tab: its logo, name and whether it's connected, laid out
 * like the companies list; the row opens the ATS's page (its linked jobs), its buttons sit on
 * top. */
export function AtsConnectionRow({
  companyId,
  companyName,
  provider,
  connection,
  canEdit,
}: {
  companyId: string
  companyName: string
  provider: AtsProvider
  connection: AtsConnection | null
  canEdit: boolean
}) {
  const t = useTranslations("ats")

  return (
    <IntegrationRow
      href={`/companies/${companyId}/integrations/${provider.id}`}
      logo={
        // The ATS's own icon (public/ats), as the companies list shows a logo; filling its tile, so
        // a row taller than the icon leaves no gap above or below it.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={provider.logo} alt="" className="size-full object-cover" />
      }
      name={provider.name}
      status={<AtsStatus connection={connection} />}
      text={
        connection ? (
          <AtsAccount connection={connection} companyName={companyName} />
        ) : (
          t("rowText", { ats: provider.name })
        )
      }
      actions={
        <AtsActions
          companyId={companyId}
          provider={provider}
          connection={connection}
          canEdit={canEdit}
        />
      }
    />
  )
}

/** What the company is connected as: its account in the ATS or, where the ATS names none
 * (Greenhouse), the company's own name; nothing before it's connected. */
export function AtsAccount({
  connection,
  companyName,
  className,
}: {
  connection: AtsConnection | null
  companyName: string
  className?: string
}) {
  if (!connection) {
    return null
  }

  return <span className={className}>{connection.account || companyName}</span>
}

/** "connected" beside the ATS's name once it is, like an interview's status tag; that it needs
 * reconnecting when its key stopped working; nothing otherwise. */
export function AtsStatus({
  connection,
}: {
  connection: AtsConnection | null
}) {
  const t = useTranslations("ats")

  if (connection?.status === "broken") {
    return <NeedsReconnecting />
  }

  if (connection?.status !== "connected") {
    return null
  }

  return (
    <Badge className="h-8 shrink-0 px-4 text-sm font-light">
      {t("statusConnected")}
    </Badge>
  )
}

/** An ATS's buttons, on its row and its page: how candidates flow, and for owners and admins
 * Connect (or Reconnect when its key stopped working) and Disconnect. Greenhouse's and
 * Teamtailor's web hooks are set up by hand: their steps are in the info dialog, which opens
 * once it's connected. Connect or Reconnect is a button, the rest in its "⋮" menu; `only` keeps
 * one of the two, for a page placing them apart, and `connectClassName` sizes the button. */
export function AtsActions({
  companyId,
  provider,
  connection,
  canEdit,
  only,
  connectClassName,
  setup = false,
}: {
  companyId: string
  provider: AtsProvider
  connection: AtsConnection | null
  canEdit: boolean
  only?: "connect" | "menu"
  connectClassName?: string
  // Just connected from the page's own Connect: its instructions open.
  setup?: boolean
}) {
  const t = useTranslations("ats")
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [info, setInfo] = useState(setup)
  const broken = connection?.status === "broken"
  const hooked = provider.id in WEBHOOKS
  const canDisconnect = canEdit && connection !== null

  async function disconnect() {
    setBusy(true)

    try {
      await apiFetch(`/ats/${provider.id}?company_id=${companyId}`, {
        method: "DELETE",
      })
      setConfirming(false)
      router.refresh()
    } catch (error) {
      toast.error(
        apiErrorMessage(error, t("disconnectFailed", { ats: provider.name }))
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className={INTEGRATION_ACTIONS} data-testid="integration-actions">
      <CandidateFlow
        provider={provider}
        open={info}
        onOpenChange={setInfo}
        noButton
      >
        {canEdit && hooked && connection?.status === "connected" && (
          <AtsWebhook
            companyId={companyId}
            provider={provider as AtsProvider & { id: keyof typeof WEBHOOKS }}
          />
        )}
      </CandidateFlow>
      {canEdit && only !== "menu" && (connection === null || broken) && (
        <ConnectAts
          companyId={companyId}
          provider={provider}
          again={broken}
          // The page's own Connect goes away once connected, so the menu's instructions open.
          onConnected={() =>
            hooked &&
            (only === "connect" ? router.replace("?setup=1") : setInfo(true))
          }
          triggerClassName={connectClassName}
        />
      )}
      {only !== "connect" && (
        <ConnectionMenu
          onInstructions={() => setInfo(true)}
          onDisconnect={canDisconnect ? () => setConfirming(true) : undefined}
        />
      )}
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t("disconnectTitle", { ats: provider.name })}
        text={t("disconnectText")}
        confirm={t("disconnect")}
        busy={busy}
        onConfirm={disconnect}
      />
    </span>
  )
}
