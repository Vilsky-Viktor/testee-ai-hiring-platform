"use client"

import Link from "next/link"
import {
  DollarSignIcon,
  GiftIcon,
  type LucideIcon,
  RotateCcwIcon,
  UserRoundIcon,
} from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { useLocalTime } from "@/hooks/use-local-time"
import { CreditAmount } from "@/features/billing/components/credit-amount"
import { InvoiceLink } from "@/features/billing/components/invoice-link"
import { Dotted } from "@/components/common/dot"
import { candidateHref, type CandidateLinks } from "@/lib/candidate-links"
import { formatPrice } from "@/lib/format"
import { hasMessage } from "@/lib/messages"
import type { CreditHistoryEntry } from "@/types/company"
import { ROW_HOVER, ROW_ICON } from "@/config/lists"

// Each kind of movement's icon; the others are gifts of one sort or another.
const ICONS: Record<string, LucideIcon> = {
  topup: DollarSignIcon,
  candidate: UserRoundIcon,
  refund: RotateCcwIcon,
  chargeback: RotateCcwIcon,
  chargeback_reversed: RotateCcwIcon,
}

/** One movement of a company's credits: what it was, when, and the credits it moved; a top-up
 * with what was paid and its invoice, a candidate's charge with the candidate and their test,
 * an adjustment with why. `api` is the company's billing routes; `links` is where a charge's
 * candidate opens (the company's page, or the admin zone's support page). */
export function HistoryRow({
  companyId,
  entry,
  api,
  links,
}: {
  companyId: string
  entry: CreditHistoryEntry
  api: string
  links: CandidateLinks
}) {
  const t = useTranslations("companyBilling")
  const locale = useLocale()
  const localTime = useLocalTime()
  const candidate = entry.candidate
  const reason = `reasons.${entry.reason}` as const
  const Icon = ICONS[entry.reason] ?? GiftIcon

  const content = (
    <span className="flex items-center gap-4 p-6 max-sm:flex-wrap">
      {/* What kind of movement it was, at a glance. */}
      <span aria-hidden className={ROW_ICON}>
        <Icon className="size-5" />
      </span>
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
        </span>
      </span>
      {entry.invoice_id && (
        <span className="shrink-0 max-sm:order-last max-sm:w-full max-sm:ps-14">
          <InvoiceLink api={api} transactionId={entry.invoice_id} />
        </span>
      )}
      <CreditAmount amount={entry.amount} />
    </span>
  )

  // A candidate's charge opens the candidate.
  return candidate ? (
    <Link
      href={candidateHref(links, companyId, candidate)}
      className={`group/row block ${ROW_HOVER}`}
    >
      {content}
    </Link>
  ) : (
    <div className={`group/row ${ROW_HOVER}`}>{content}</div>
  )
}
