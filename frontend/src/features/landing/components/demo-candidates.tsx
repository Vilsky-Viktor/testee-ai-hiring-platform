"use client"

import { cn } from "cn"

import { DemoCandidateSearch } from "@/features/landing/components/demo-candidate-search"
import { PROMO_POP } from "@/features/landing/components/demo-panel"
import { DemoInterviewTabs } from "@/features/landing/components/demo-interview-tabs"
import { DemoReportActions } from "@/features/landing/components/demo-share"
import { InterviewHeader } from "@/features/landing/components/interview-header"
import { CandidateRow } from "@/components/common/candidate-row"
import { SearchedList } from "@/components/common/searched-list"
import {
  DEMO_CANDIDATE_COUNT,
  DEMO_NOTE_COUNT,
  DEMO_REPORT_CANDIDATES,
  DEMO_REPORT_INTERVIEW,
} from "@/config/reports-demo"

/** An interview's candidates tab, for the landing: its header with the report's actions (the
 * one `pressed` pressed in), its tabs, and the candidates as the real list's rows, with their
 * grades and integrity signals; the row `opened` (its place) shaded as it's clicked. Each row is
 * the pointer's "row<place>". Each time the list is `shown`, its rows pop in one after another. */
export function DemoCandidates({
  shown,
  pressed,
  opened,
}: {
  shown: boolean
  pressed: "download" | "share" | null
  opened: number | null
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <InterviewHeader {...DEMO_REPORT_INTERVIEW} status="in_process" />
        <DemoReportActions pressed={pressed} />
      </div>
      <DemoInterviewTabs
        current="candidates"
        counts={{
          topics: DEMO_REPORT_INTERVIEW.topics,
          candidates: DEMO_CANDIDATE_COUNT,
          notes: DEMO_NOTE_COUNT,
        }}
      />
      {/* Cut off at the picture's bottom, as a long list is. */}
      <div className="min-h-0 overflow-hidden">
        <SearchedList>
          <DemoCandidateSearch />
          <ul className="min-h-0 divide-y overflow-hidden rounded-xl border searched:rounded-t-none searched:border-t-0">
            {DEMO_REPORT_CANDIDATES.map((candidate, index) => (
              <li
                key={candidate.email}
                data-demo-target={`row${index}`}
                style={{ animationDelay: `${200 + index * 70}ms` }}
                className={cn(
                  "relative transition-colors [&_a>span]:py-3",
                  opened === index && "bg-surface",
                  shown && PROMO_POP
                )}
              >
                {/* Where the camera looks when it zooms on the row: its title, at the start. */}
                <span
                  data-camera-focus
                  className="pointer-events-none absolute start-[22%] top-1/2 size-px"
                />
                <CandidateRow candidate={candidate} href="#reports" />
              </li>
            ))}
          </ul>
        </SearchedList>
      </div>
    </div>
  )
}
