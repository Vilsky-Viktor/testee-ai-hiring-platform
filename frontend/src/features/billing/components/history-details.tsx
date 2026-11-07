"use client"

import { useLocale, useTranslations } from "next-intl"

import { HeldBack } from "@/features/billing/components/refund-button"
import { Dotted } from "@/components/common/dot"
import { useLocalTime } from "@/hooks/use-local-time"
import { formatPrice } from "@/lib/format"
import { hasMessage } from "@/lib/messages"
import type { CreditHistoryEntry } from "@/types/company"

/** When a movement was, the money it moved and how: automatic, or a top-up's refund. */
function HistoryMeta({ entry }: { entry: CreditHistoryEntry }) {
  const t = useTranslations("companyBilling")
  const locale = useLocale()
  const localTime = useLocalTime()
  const status = entry.refund?.status

  return (
    <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
      <time dateTime={entry.created_at} suppressHydrationWarning>
        {localTime.date(entry.created_at)}
      </time>
      {entry.total != null && entry.currency && (
        <span className="tabular-nums">
          {formatPrice(Number(entry.total), entry.currency, locale)}
        </span>
      )}
      {entry.automatic && <span>{t("automatic")}</span>}
      {status && (
        <span data-testid="refund-status" data-status={status}>
          {t(`refund.status.${status}`)}
        </span>
      )}
    </span>
  )
}

/** What a movement of credits was, in a row of the history. `heldBack`: the candidates whose
 * reserved credits are why a top-up can't be refunded yet. */
export function HistoryDetails({
  companyId,
  entry,
  heldBack,
}: {
  companyId: string
  entry: CreditHistoryEntry
  heldBack: number
}) {
  const t = useTranslations("companyBilling")
  const candidate = entry.candidate
  const reason = `reasons.${entry.reason}` as const

  return (
    <span className="min-w-0 flex-1 space-y-1">
      {/* A candidate's charge leads with the candidate, like the candidate lists. */}
      <span className="block text-lg font-medium break-all normal-case">
        {candidate
          ? (candidate.name ?? candidate.email)
          : hasMessage(t, reason)
            ? t(reason)
            : entry.reason}
      </span>
      {candidate && (
        <span className="block text-sm break-all text-muted-foreground normal-case">
          <Dotted
            items={[
              candidate.name && candidate.email,
              candidate.interview_title,
            ]}
          />
        </span>
      )}
      {entry.note && (
        <span className="block text-sm break-words text-muted-foreground normal-case">
          {entry.note}
        </span>
      )}
      {entry.candidate_deleted && (
        <span className="block text-sm text-muted-foreground">
          {t("deletedCandidate")}
        </span>
      )}
      <HistoryMeta entry={entry} />
      {heldBack > 0 && (
        <span
          className="block text-sm text-muted-foreground"
          data-testid="refund-held-back"
        >
          <HeldBack companyId={companyId} candidates={heldBack} />
        </span>
      )}
    </span>
  )
}
