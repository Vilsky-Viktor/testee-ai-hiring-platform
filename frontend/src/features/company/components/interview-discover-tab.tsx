"use client"

import { InfoIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { DiscoverRow } from "@/features/company/components/discover-row"
import { VirtualList } from "@/components/common/virtual-list"
import { LIST_BOX, LIST_EMPTY } from "@/config/lists"
import { usePagedList } from "@/hooks/use-paged-list"
import { discoverPath } from "@/lib/interview-discover"
import type { DiscoverPerson } from "@/types/company"

/** An interview's Discover tab: what it lists, in one quiet line, then the people open to offers whose practice
 * matches the interview, a page at a time, in the order the API gives (who practised last
 * first); `initial` is the server's first page. */
export function InterviewDiscoverTab({
  interviewId,
  canEdit,
  initial,
}: {
  interviewId: string
  canEdit: boolean
  // Null when the server couldn't load it: the list then loads here.
  initial: DiscoverPerson[] | null
}) {
  const t = useTranslations("interviews")
  const path = discoverPath(interviewId)
  const { items, loadMore } = usePagedList(
    path,
    (person: DiscoverPerson) => person.id,
    initial ?? undefined
  )

  return (
    <div className="space-y-6">
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <InfoIcon aria-hidden className="size-4 shrink-0" />
        {t("discoverText")}
      </p>
      {items.length === 0 ? (
        <div className={`${LIST_EMPTY} space-y-1`}>
          <p>{t("discoverEmpty")}</p>
          <p className="text-sm">{t("discoverEmptyHint")}</p>
        </div>
      ) : (
        <VirtualList
          items={items}
          getKey={(person) => person.id}
          estimateSize={140}
          onEndReached={loadMore}
          className={`${LIST_BOX} overflow-hidden`}
          renderItem={(person) => (
            <DiscoverRow
              person={person}
              invitePath={`${path}/${encodeURIComponent(person.id)}/invite`}
              canEdit={canEdit}
            />
          )}
        />
      )}
    </div>
  )
}
