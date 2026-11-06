import { getTranslations } from "next-intl/server"

import { InterviewReportActions } from "@/features/company/components/interview-report-actions"
import { InviteCandidate } from "@/features/company/components/invite-candidate"
import { InterviewTopMenu } from "@/features/company/components/interview-top-menu"
import type { InterviewTab } from "@/lib/interview-page"
import type { InterviewDetail } from "@/types/company"

/** The buttons beside an interview's title: on every tab the menu of trying and deleting it, on
 * its candidates also the report in it and inviting; deleting and inviting only for those who
 * can edit. */
export async function InterviewActions({
  interview,
  current,
  canEdit,
  interviewsHref,
  maxInvites,
}: {
  interview: InterviewDetail
  current: InterviewTab
  canEdit: boolean
  interviewsHref: string
  maxInvites: number | null
}) {
  const t = await getTranslations("interviews")
  const ready = Boolean(interview.set_id)
  const title = interview.title ?? t("fallbackTitle")

  if (!ready) {
    return null
  }

  const menu = (
    <InterviewTopMenu
      interviewId={interview.id}
      title={title}
      interviewsHref={interviewsHref}
      canEdit={canEdit}
    />
  )

  if (current !== "candidates") {
    return menu
  }

  return (
    <>
      {/* With nobody invited yet, the empty list offers it instead. */}
      {canEdit && interview.candidate_count > 0 && (
        <InviteCandidate
          interviewId={interview.id}
          candidatesHref={`${interviewsHref}/${interview.id}?tab=candidates`}
          maxInvites={maxInvites}
        />
      )}
      {interview.candidate_count > 0 ? (
        <InterviewReportActions
          interviewId={interview.id}
          title={title}
          interviewsHref={interviewsHref}
          canEdit={canEdit}
        />
      ) : (
        menu
      )}
    </>
  )
}
