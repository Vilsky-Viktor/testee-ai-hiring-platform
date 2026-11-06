import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { BackLink } from "@/components/common/back-link"
import { AnswerPatternsCard } from "@/features/company/components/answer-patterns"
import { CandidateSetup } from "@/features/company/components/candidate-setup"
import { CandidateTitle } from "@/features/company/components/candidate-title"
import { CandidatePageMenu } from "@/features/company/components/candidate-page-menu"
import { CandidateSummary } from "@/features/company/components/candidate-summary"
import { CandidateReport } from "@/features/company/components/candidate-report"
import { ScorecardTopics } from "@/features/company/components/scorecard-topics"
import { PageHeader } from "@/components/common/page-header"
import { SignInPage } from "@/components/common/sign-in-page"
import { serverFetch, signedIn } from "@/lib/server-api"
import { translatedTitle } from "@/lib/site"
import type { Scorecard } from "@/types/company"
import { candidateReportData } from "@/lib/candidate-report-data"
import { hasMessage } from "@/lib/messages"

export const generateMetadata = () => translatedTitle("candidates", "scorecard")

// A candidate's status by its name, or as the API sent it when there's none.
async function statusName(status: string) {
  const statuses = await getTranslations("candidateStatus")

  return hasMessage(statuses, status) ? statuses(status) : status
}

export default async function ScorecardPage({
  params,
}: {
  params: Promise<{ companyId: string; id: string; inviteId: string }>
}) {
  if (!(await signedIn())) {
    return <SignInPage />
  }

  const { companyId, id, inviteId } = await params
  const t = await getTranslations("candidates")
  const card = await serverFetch<Scorecard>(
    `/companies/interviews/${id}/candidates/${inviteId}`
  )

  if (!card) {
    notFound()
  }

  const deleted = card.status === "deleted"

  const reportable = !deleted && card.sessions.length > 0
  const report = candidateReportData(card)
  const candidatesHref = `/companies/${companyId}/interviews/${id}?tab=candidates`

  return (
    <main className="mx-auto max-w-page space-y-8 px-6 py-12">
      {reportable && <CandidateReport report={report} />}
      {/* The menu sits beside the name and status. */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <PageHeader
            back={
              <BackLink
                href={candidatesHref}
                help="candidate"
                // On the email's line, so the info button lines up with the name and status.
                className="wide:inset-y-auto wide:-top-1.5 wide:my-0"
              >
                {t("interview")}
              </BackLink>
            }
            title={
              <CandidateTitle
                card={card}
                interviewId={id}
                inviteId={inviteId}
                status={await statusName(card.status)}
              />
            }
          />
        </div>
        {!deleted && (
          <CandidatePageMenu
            interviewId={id}
            card={card}
            report={reportable ? report : null}
            backHref={candidatesHref}
          />
        )}
      </div>

      <CandidateSetup card={card} interviewId={id} inviteId={inviteId} />

      {card.sessions.length > 0 && <CandidateSummary card={card} />}

      <AnswerPatternsCard
        patterns={card.answer_patterns}
        language={card.language}
      />

      {card.sessions.length === 0 && (
        <p className="py-16 text-center text-muted-foreground">
          {deleted ? t("deletedText") : t("notStarted")}
        </p>
      )}

      {card.sessions.length > 0 && (
        <ScorecardTopics sessions={card.sessions} language={card.language} />
      )}
    </main>
  )
}
