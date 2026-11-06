"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { ConnectionMenu } from "@/components/common/dots-menu"
import {
  IntegrationRow,
  NeedsReconnecting,
} from "@/features/company/components/integration-row"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { InstructionsDialog } from "@/components/common/instructions-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dotted } from "@/components/common/dot"
import { INTEGRATION_ACTIONS } from "@/config/lists"
import { SLACK } from "@/config/slack"
import { apiErrorMessage, apiFetch } from "@/lib/api"
import type { SlackOverview } from "@/types/notifications"
import { openAddress } from "@/lib/navigation"

const STEPS = ["stepAdd", "stepChannel", "stepKinds", "stepPrivacy"] as const

/** Slack's row on the integrations tab, laid out like an ATS's: its mark, name, whether it's
 * connected and to which channel; the row opens Slack's page, its buttons sit on top. */
export function SlackRow({
  companyId,
  slack,
  canEdit,
}: {
  companyId: string
  slack: SlackOverview
  canEdit: boolean
}) {
  const t = useTranslations("slack")

  return (
    <IntegrationRow
      href={`/companies/${companyId}/integrations/slack`}
      logoClassName="p-6 max-sm:p-2"
      logo={
        // eslint-disable-next-line @next/next/no-img-element
        <img src={SLACK.logo} alt="" className="size-full object-contain" />
      }
      name={SLACK.name}
      status={<SlackStatus slack={slack} />}
      text={
        slack.connected ? (
          <Dotted items={[slack.team, slack.channel]} />
        ) : (
          t("rowText")
        )
      }
      actions={
        <SlackActions companyId={companyId} slack={slack} canEdit={canEdit} />
      }
    />
  )
}

/** "connected" beside Slack's name once it works, like an ATS's tag; that it needs reconnecting
 * when Slack stopped taking messages; nothing otherwise. */
export function SlackStatus({ slack }: { slack: SlackOverview }) {
  const t = useTranslations("ats")

  if (slack.connected && slack.status !== "connected") {
    return <NeedsReconnecting />
  }

  if (slack.status !== "connected") {
    return null
  }

  return (
    <Badge className="h-8 shrink-0 px-4 text-sm font-light">
      {t("statusConnected")}
    </Badge>
  )
}

/** Add to Slack (Reconnect, with `again`): goes to Slack to pick a channel and comes back. */
export function SlackConnectButton({
  companyId,
  again = false,
  className = "h-10 px-5 text-base",
}: {
  companyId: string
  again?: boolean
  className?: string
}) {
  const t = useTranslations("slack")
  const ats = useTranslations("ats")
  const [busy, setBusy] = useState(false)

  async function connect() {
    setBusy(true)

    try {
      const { url } = await apiFetch<{ url: string }>(
        `/notifications/slack/start?company_id=${companyId}`
      )
      openAddress(url)
    } catch (error) {
      toast.error(apiErrorMessage(error, t("connectFailed")))
      setBusy(false)
    }
  }

  return (
    <Button className={className} disabled={busy} onClick={connect}>
      {again ? ats("reconnect") : t("add")}
    </Button>
  )
}

/** Slack's actions: its Instructions, and for owners and admins Disconnect in its "⋮" menu, with
 * Add to Slack or Reconnect beside it, unless `noConnect` (its page has its own). */
export function SlackActions({
  companyId,
  slack,
  canEdit,
  noConnect = false,
}: {
  companyId: string
  slack: SlackOverview
  canEdit: boolean
  noConnect?: boolean
}) {
  const t = useTranslations("slack")
  const ats = useTranslations("ats")
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [info, setInfo] = useState(false)
  const canDisconnect = canEdit && slack.connected

  async function disconnect() {
    setBusy(true)

    try {
      await apiFetch(`/notifications/slack?company_id=${companyId}`, {
        method: "DELETE",
      })
      setConfirming(false)
      router.refresh()
    } catch (error) {
      toast.error(apiErrorMessage(error, t("disconnectFailed")))
    } finally {
      setBusy(false)
    }
  }

  return (
    <span className={INTEGRATION_ACTIONS} data-testid="integration-actions">
      <InstructionsDialog
        title={t("instructionsTitle")}
        steps={STEPS.map((step) => t(step))}
        open={info}
        onOpenChange={setInfo}
        noButton
      />
      {canEdit &&
        !noConnect &&
        (!slack.connected || slack.status !== "connected") && (
          <SlackConnectButton companyId={companyId} again={slack.connected} />
        )}
      <ConnectionMenu
        onInstructions={() => setInfo(true)}
        onDisconnect={canDisconnect ? () => setConfirming(true) : undefined}
      />
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t("disconnectTitle")}
        text={t("disconnectText")}
        confirm={ats("disconnect")}
        busy={busy}
        onConfirm={disconnect}
      />
    </span>
  )
}
