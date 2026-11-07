"use client"

import Link from "next/link"
import {
  DollarSignIcon,
  GiftIcon,
  type LucideIcon,
  RotateCcwIcon,
  UserRoundIcon,
} from "lucide-react"

import { CreditAmount } from "@/features/billing/components/credit-amount"
import { InvoiceLink } from "@/features/billing/components/invoice-link"
import { HistoryDetails } from "@/features/billing/components/history-details"
import { RefundButton } from "@/features/billing/components/refund-button"
import { candidateHref, type CandidateLinks } from "@/lib/candidate-links"
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
 * candidate opens (the company's page, or the admin zone's support page); `canRefund` offers a
 * top-up's refund, which only the company itself does. */
export function HistoryRow({
  companyId,
  entry,
  api,
  links,
  canRefund,
}: {
  companyId: string
  entry: CreditHistoryEntry
  api: string
  links: CandidateLinks
  canRefund: boolean
}) {
  const candidate = entry.candidate
  const Icon = ICONS[entry.reason] ?? GiftIcon
  const refund = entry.refund
  const offer = canRefund ? refund?.offer : null

  const content = (
    <span className="flex items-center gap-4 p-6 max-sm:flex-wrap">
      {/* What kind of movement it was, at a glance. */}
      <span aria-hidden className={ROW_ICON}>
        <Icon className="size-5" />
      </span>
      <HistoryDetails
        companyId={companyId}
        entry={entry}
        heldBack={
          offer ? 0 : canRefund ? (refund?.held_back_candidates ?? 0) : 0
        }
      />
      {entry.invoice_id && (
        <span className="flex shrink-0 flex-wrap items-center gap-2 max-sm:order-last max-sm:w-full max-sm:ps-14">
          {offer && (
            <RefundButton
              companyId={companyId}
              transactionId={entry.invoice_id}
              offer={offer}
              heldBack={refund?.held_back_candidates ?? 0}
            />
          )}
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
