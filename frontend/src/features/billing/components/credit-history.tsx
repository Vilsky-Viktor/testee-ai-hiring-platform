"use client"

import { useFormatter, useTranslations } from "next-intl"

import { HistoryRow } from "@/features/billing/components/history-row"
import { VirtualList } from "@/components/common/virtual-list"
import { LIST_BOX } from "@/config/lists"
import { usePagedList } from "@/hooks/use-paged-list"
import type { CandidateLinks } from "@/lib/candidate-links"
import type { CreditHistoryEntry } from "@/types/company"

function byId(entry: CreditHistoryEntry) {
  return entry.id
}

/** Every movement of a company's credits, newest first, under their months, a page at a time;
 * `initial` is the server's first page. `api` is the company's billing routes, its own by default (the admin
 * zone's support page passes its own, and `links="support"`: its candidates open there).
 * `canRefund` is for the company's own page: support only sees a refund's state. */
export function CreditHistory({
  companyId,
  initial,
  api = `/companies/companies/${companyId}/billing`,
  links = "company",
  kind,
  canRefund = false,
}: {
  companyId: string
  initial: CreditHistoryEntry[]
  api?: string
  links?: CandidateLinks
  // Only this kind of movement.
  kind?: string
  canRefund?: boolean
}) {
  const t = useTranslations("companyBilling")
  const format = useFormatter()
  const path = `${api}/history${kind ? `?kind=${kind}` : ""}`
  const { items, loadMore } = usePagedList(path, byId, initial)
  const month = (entry: CreditHistoryEntry) =>
    format.dateTime(new Date(entry.created_at), {
      year: "numeric",
      month: "long",
    })

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">{t("empty")}</p>
    )
  }

  return (
    <VirtualList
      items={items}
      getKey={byId}
      estimateSize={105}
      onEndReached={loadMore}
      className={`${LIST_BOX} overflow-hidden`}
      renderItem={(entry, index) => (
        <>
          {/* A month's first row carries the month. */}
          {(index === 0 || month(items[index - 1]) !== month(entry)) && (
            <h3
              suppressHydrationWarning
              data-testid="history-month"
              className="bg-surface px-6 py-2 text-sm text-muted-foreground"
            >
              {month(entry)}
            </h3>
          )}
          <HistoryRow
            companyId={companyId}
            entry={entry}
            api={api}
            links={links}
            canRefund={canRefund}
          />
        </>
      )}
    />
  )
}
