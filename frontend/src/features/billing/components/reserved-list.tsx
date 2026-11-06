"use client"

import { UserRoundIcon } from "lucide-react"
import Link from "next/link"

import { NoName } from "@/components/common/no-name"
import { VirtualList } from "@/components/common/virtual-list"
import { WrappedEmail } from "@/components/common/wrapped-email"
import { Dot } from "@/components/common/dot"
import { LIST_BOX, ROW_HOVER, ROW_ICON } from "@/config/lists"
import { usePagedList } from "@/hooks/use-paged-list"
import { candidateHref, type CandidateLinks } from "@/lib/candidate-links"
import type { CreditCandidate } from "@/types/company"

function byInvite(candidate: CreditCandidate) {
  return candidate.invite_id
}

/** Candidates invited who haven't finished, whose credits are set aside, newest first; each
 * opens the candidate. `initial` is the server's first page. `api` is the company's billing
 * routes, its own by default; the admin zone's support page passes its own and
 * `links="support"`, so its candidates open there. */
export function ReservedList({
  companyId,
  initial,
  api = `/companies/companies/${companyId}/billing`,
  links = "company",
}: {
  companyId: string
  initial: CreditCandidate[]
  api?: string
  links?: CandidateLinks
}) {
  const { items, loadMore } = usePagedList(`${api}/reserved`, byInvite, initial)

  return (
    <VirtualList
      items={items}
      getKey={byInvite}
      estimateSize={105}
      onEndReached={loadMore}
      className={LIST_BOX}
      renderItem={(candidate) => {
        return (
          <Link
            href={candidateHref(links, companyId, candidate)}
            className={`group/row flex items-center gap-4 p-6 ${ROW_HOVER}`}
          >
            <span aria-hidden className={ROW_ICON}>
              <UserRoundIcon className="size-5" />
            </span>
            <span className="min-w-0 space-y-1">
              <span className="block text-lg font-medium">
                <WrappedEmail email={candidate.email} />
              </span>
              <span className="block text-sm break-all text-muted-foreground">
                {candidate.name ?? <NoName hint="list" />}
                {candidate.interview_title && (
                  <span className="normal-case">
                    <Dot />
                    {candidate.interview_title}
                  </span>
                )}
              </span>
            </span>
          </Link>
        )
      }}
    />
  )
}
