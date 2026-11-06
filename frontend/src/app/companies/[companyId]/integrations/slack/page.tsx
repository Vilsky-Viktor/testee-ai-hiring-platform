import { CheckIcon } from "lucide-react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Suspense } from "react"

import { BackLink } from "@/components/common/back-link"
import {
  SlackActions,
  SlackConnectButton,
  SlackStatus,
} from "@/features/company/components/slack-connection"
import { SlackKinds } from "@/features/company/components/slack-kinds"
import { SlackPreview } from "@/features/company/components/slack-preview"
import { SlackReturned } from "@/features/company/components/slack-returned"
import { PageHeader } from "@/components/common/page-header"
import { WarningCard } from "@/components/common/warning-card"
import { Badge } from "@/components/ui/badge"
import { SignInPrompt } from "@/components/common/sign-in-prompt"
import { TOKEN_COOKIE } from "@/config/auth"
import { SLACK } from "@/config/slack"
import { serverFetch } from "@/lib/server-api"
import type { Company } from "@/types/company"
import type { SlackOverview } from "@/types/notifications"

export const generateMetadata = () => ({ title: SLACK.name })

// What connecting it means, said before it's connected.
const POINTS = ["pointChannel", "pointKinds", "pointPrivacy"] as const

/** Slack's own page, laid out like an ATS's: back to the integrations tab, its status, channel
 * and "⋮" menu; once connected, which notifications go to the channel, under a warning with
 * Reconnect when it stopped working; before, what a message looks like and Add to Slack. */
export default async function SlackPage({
  params,
}: {
  params: Promise<{ companyId: string }>
}) {
  const { companyId } = await params
  const signedIn = (await cookies()).has(TOKEN_COOKIE)
  const t = await getTranslations("company")
  const slackText = await getTranslations("slack")
  // Asked together: the API refuses Slack's state on its own when the company isn't theirs.
  const [company, slack] = signedIn
    ? await Promise.all([
        serverFetch<Company>(`/companies/companies/${companyId}`),
        serverFetch<SlackOverview>(
          `/notifications/slack?company_id=${companyId}`
        ),
      ])
    : [null, null]

  if (!signedIn) {
    return (
      <main className="mx-auto max-w-page px-6 py-12">
        <SignInPrompt />
      </main>
    )
  }

  if (!company || !slack) {
    redirect("/companies")
  }

  return (
    <main className="mx-auto max-w-page space-y-8 px-6 py-12">
      <Suspense>
        <SlackReturned />
      </Suspense>
      <PageHeader
        back={
          <BackLink href={`/companies/${companyId}/integrations`} help="slack">
            {t("integrations")}
          </BackLink>
        }
        title={
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SLACK.logo}
                alt=""
                className="size-12 shrink-0 rounded-xl bg-surface p-2"
              />
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="font-heading text-3xl font-medium tracking-tight normal-case">
                    {SLACK.name}
                  </h1>
                  <span className="max-sm:hidden">
                    <SlackStatus slack={slack} />
                  </span>
                </div>
                {slack.connected && (
                  <p className="flex flex-wrap items-center gap-2 text-base text-muted-foreground">
                    {slack.team}
                    <Badge
                      variant="outline"
                      className="h-7 px-3 text-sm font-light"
                    >
                      {slack.channel}
                    </Badge>
                  </p>
                )}
                {/* On phones "connected" goes under the name and channel. */}
                <span className="mt-2 flex empty:hidden sm:hidden">
                  <SlackStatus slack={slack} />
                </span>
              </div>
            </div>
            <SlackActions
              companyId={companyId}
              slack={slack}
              canEdit={company.can_edit}
              noConnect
            />
          </div>
        }
      />
      {slack.connected ? (
        <>
          {slack.status !== "connected" && (
            <WarningCard
              action={
                company.can_edit && (
                  <SlackConnectButton companyId={companyId} again />
                )
              }
            >
              {slackText("brokenText")}
            </WarningCard>
          )}
          <SlackKinds
            companyId={companyId}
            kinds={slack.kinds}
            allKinds={slack.all_kinds}
            canEdit={company.can_edit}
          />
        </>
      ) : (
        <div
          className="mx-auto max-w-xl space-y-8 py-4"
          data-testid="slack-start"
        >
          <SlackPreview kind={slack.all_kinds[0]} />
          <ul className="space-y-2 text-base text-muted-foreground">
            {POINTS.map((point) => (
              <li key={point} className="flex gap-3">
                <CheckIcon
                  aria-hidden
                  className="mt-0.5 size-5 shrink-0 text-primary"
                />
                {slackText(point)}
              </li>
            ))}
          </ul>
          {company.can_edit && (
            <SlackConnectButton
              companyId={companyId}
              className="h-14 w-full text-lg"
            />
          )}
        </div>
      )}
    </main>
  )
}
