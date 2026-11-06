import { getLocale, getTranslations } from "next-intl/server"

import { FilterPills } from "@/components/common/filter-pills"
import { SearchedList } from "@/components/common/searched-list"
import { ShortNumber } from "@/components/common/short-number"
import { SummaryCards } from "@/components/common/summary-cards"
import { CandidateList } from "@/features/company/components/candidate-list"
import { CandidateSearch } from "@/features/company/components/candidate-search"
import { InviteCandidate } from "@/features/company/components/invite-candidate"
import type { CandidateSort } from "@/config/interviews"
import { formatPercent } from "@/lib/format"
import { candidatesPath } from "@/lib/interview-page"
import { hasMessage } from "@/lib/messages"
import type {
  Candidate,
  CandidateFilters,
  CandidateSummary,
  InterviewDetail,
} from "@/types/company"

/** An interview's candidates tab: how they're doing, the status filter with what each holds, the
 * search and sort, and the candidates, their first page from the server; with nobody invited, a
 * line and the way to invite. */
export async function InterviewCandidatesTab({
  interview,
  interviewHref,
  canEdit,
  sort,
  search,
  status,
  filters,
  summary,
  candidates,
  maxInvites,
}: {
  interview: InterviewDetail
  interviewHref: string
  canEdit: boolean
  sort: CandidateSort
  search: string
  status: string | null
  filters: CandidateFilters | null
  summary: CandidateSummary | null
  candidates: Candidate[] | null
  maxInvites: number | null
}) {
  const t = await getTranslations("candidates")
  const labels = await getTranslations("candidateStatus")
  const locale = await getLocale()

  if (summary?.total === 0 && !search && !status) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-muted-foreground">{t("empty")}</p>
        {canEdit && (
          <InviteCandidate
            interviewId={interview.id}
            candidatesHref={`${interviewHref}?tab=candidates`}
            maxInvites={maxInvites}
          />
        )}
      </div>
    )
  }

  // The address with `option` chosen, keeping the sort and the search.
  function statusHref(option?: string) {
    const params = new URLSearchParams({ tab: "candidates", sort })

    if (search) {
      params.set("q", search)
    }

    if (option) {
      params.set("status", option)
    }

    return `${interviewHref}?${params}`
  }

  const held = (filters?.filters ?? []).filter(
    (option) => summary?.counts[option] || option === status
  )

  return (
    <div className="space-y-4">
      {summary && (
        <SummaryCards
          testId="candidate-summary"
          className="lg:grid-cols-4"
          rows={[
            {
              id: "invited",
              label: t("summary.invited"),
              value: <ShortNumber value={summary.total} />,
            },
            {
              id: "finished",
              label: t("summary.finished"),
              value: <ShortNumber value={summary.finished} />,
            },
            {
              id: "passed",
              label: t("summary.passed"),
              value: <ShortNumber value={summary.passed} />,
            },
            {
              id: "average",
              label: t("summary.average"),
              value:
                summary.average_grade === null
                  ? "–"
                  : formatPercent(summary.average_grade, locale),
            },
          ]}
        />
      )}
      <FilterPills
        testId="candidate-status"
        items={[
          {
            id: "all",
            label: t("allStatuses"),
            href: statusHref(),
            chosen: !status,
            count: summary?.total,
          },
          ...held.map((option) => ({
            id: option,
            label: hasMessage(labels, option) ? labels(option) : option,
            href: statusHref(option),
            chosen: option === status,
            count: summary?.counts[option],
          })),
        ]}
      />
      <SearchedList>
        <CandidateSearch sort={sort} q={search} />
        <CandidateList
          path={candidatesPath(interview.id, sort, search, status)}
          interviewId={interview.id}
          interviewHref={interviewHref}
          narrowed={Boolean(search || status)}
          initial={candidates ?? []}
          canEdit={canEdit}
          voice={interview.voice ?? false}
        />
      </SearchedList>
    </div>
  )
}
