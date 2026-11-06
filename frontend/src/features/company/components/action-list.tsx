"use client"

import { useTranslations } from "next-intl"

import { VirtualList } from "@/components/common/virtual-list"
import { LIST_BOX } from "@/config/lists"
import { ActionRow } from "@/features/company/components/action-row"
import { useLocalTime } from "@/hooks/use-local-time"
import { usePagedList } from "@/hooks/use-paged-list"
import { byId } from "@/lib/paged-list"
import type { CompanyAction } from "@/types/company"

/** A company's action log from `path` (the API list with its filters), newest first, by day,
 * loading more as it scrolls; `initial` is the server's first page, if it rendered one. The
 * owner's tab and the admin zone's support page show the same rows; with a `companyId` they open
 * what they're about. `narrowed` when a filter is on. */
export function ActionList({
  path,
  initial,
  narrowed = false,
  companyId,
}: {
  path: string
  initial?: CompanyAction[]
  narrowed?: boolean
  companyId?: string
}) {
  const t = useTranslations("actionLog")
  const localTime = useLocalTime()
  const { items, loaded, loadMore } = usePagedList(path, byId, initial)
  const day = (action: CompanyAction) => localTime.recentDay(action.created_at)

  if (!loaded) {
    return null
  }

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">
        {narrowed ? t("noMatches") : t("empty")}
      </p>
    )
  }

  return (
    <VirtualList
      items={items}
      getKey={byId}
      estimateSize={105}
      onEndReached={loadMore}
      className={`${LIST_BOX} overflow-hidden`}
      renderItem={(action, index) => (
        <>
          {/* A day's first row carries the day. */}
          {(index === 0 || day(items[index - 1]) !== day(action)) && (
            <h3
              suppressHydrationWarning
              data-testid="action-day"
              className="bg-surface px-6 py-2 text-sm text-muted-foreground"
            >
              {day(action)}
            </h3>
          )}
          <ActionRow action={action} companyId={companyId} />
        </>
      )}
    />
  )
}
