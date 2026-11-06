import { cn } from "cn"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Fragment, type ReactNode } from "react"

import { AiAppsRow } from "@/features/company/components/ai-apps-row"
import { ApiRow } from "@/features/company/components/api-row"
import { AtsConnectionRow } from "@/features/company/components/ats-connection"
import { SlackRow } from "@/features/company/components/slack-connection"
import { CompanyHeader } from "@/features/company/components/company-header"
import { SignInPrompt } from "@/components/common/sign-in-prompt"
import { ATS_PROVIDERS } from "@/config/ats"
import { TOKEN_COOKIE } from "@/config/auth"
import { optionalFetch, serverFetch } from "@/lib/server-api"
import { translatedTitle } from "@/lib/site"
import { companyHeaderProps } from "@/lib/company-header"
import type { ApiSettings } from "@/types/api-access"
import type { AtsIntegrations, Company } from "@/types/company"
import type { AiConnection } from "@/types/connections"
import type { SlackOverview } from "@/types/notifications"
import { LIST_BOX } from "@/config/lists"
import { CARD } from "@/config/cards"

export const generateMetadata = () => translatedTitle("company", "integrations")

/** Where a row belongs: `status`, when it has one, says whether a connection still works. */
function stateOf(connected: boolean, status?: string | null): State {
  if (!connected) {
    return "available"
  }

  return status && status !== "connected" ? "broken" : "connected"
}

// A row's state decides its place: what's connected on top, what stopped working first of all.
type State = "broken" | "connected" | "available"
type Row = { key: string; group: string; state: State; node: ReactNode }

/** Rows under a title, in the site's list. */
function IntegrationGroup({
  title,
  keepCase = false,
  rows,
}: {
  title: string
  // An acronym: its capitals stay, though titles are lowercase.
  keepCase?: boolean
  rows: Row[]
}) {
  if (rows.length === 0) {
    return null
  }

  return (
    <section className="space-y-6">
      <h2
        className={cn(
          "font-heading text-2xl font-medium",
          keepCase && "normal-case"
        )}
      >
        {title}
      </h2>
      <ul className={`${LIST_BOX} overflow-hidden`}>
        {rows.map(({ key, node }) => (
          <Fragment key={key}>{node}</Fragment>
        ))}
      </ul>
    </section>
  )
}

/** The company's integrations: those connected first, what stopped working on top, then the rest
 * by kind (Slack; the API and AI apps; the ATSs), a row each laid out like the companies list;
 * each opens its own page. Everyone in the company sees them; owners and admins change them. */
export default async function IntegrationsPage({
  params,
}: {
  params: Promise<{ companyId: string }>
}) {
  const { companyId } = await params
  const signedIn = (await cookies()).has(TOKEN_COOKIE)
  const t = await getTranslations("ats")
  // Asked together: the API refuses each on its own when the company isn't theirs.
  const [company, integrations, slack, api, connections] = signedIn
    ? await Promise.all([
        serverFetch<Company>(`/companies/companies/${companyId}`),
        optionalFetch<AtsIntegrations>(
          `/ats/connections?company_id=${companyId}`
        ),
        optionalFetch<SlackOverview>(
          `/notifications/slack?company_id=${companyId}`
        ),
        optionalFetch<ApiSettings>(`/v1/manage?company_id=${companyId}`),
        optionalFetch<AiConnection[]>("/assistant/connections"),
      ])
    : [null, null, null, null, null]

  if (!signedIn) {
    return (
      <main className="mx-auto max-w-page px-6 py-12">
        <SignInPrompt />
      </main>
    )
  }

  if (!company) {
    redirect("/companies")
  }

  const rows: Row[] = [
    ...(slack
      ? [
          {
            key: "slack",
            group: "messaging",
            state: stateOf(slack.connected, slack.status),
            node: (
              <SlackRow
                companyId={companyId}
                slack={slack}
                canEdit={company.can_edit}
              />
            ),
          },
        ]
      : []),
    ...(api
      ? [
          {
            key: "api",
            group: "api",
            state: stateOf(api.keys.length > 0),
            node: <ApiRow companyId={companyId} settings={api} />,
          },
        ]
      : []),
    {
      key: "ai",
      group: "api",
      state: stateOf(Boolean(connections?.length)),
      node: <AiAppsRow companyId={companyId} connections={connections ?? []} />,
    },
    ...(integrations?.available
      ? ATS_PROVIDERS.map((provider) => {
          const connection =
            integrations.connections.find(
              (item) => item.provider === provider.id
            ) ?? null

          return {
            key: provider.id,
            group: "ats",
            state: stateOf(connection !== null, connection?.status),
            node: (
              <AtsConnectionRow
                companyId={companyId}
                companyName={company.name}
                provider={provider}
                connection={connection}
                canEdit={company.can_edit}
              />
            ),
          }
        })
      : []),
  ]
  const available = (group: string) =>
    rows.filter((row) => row.group === group && row.state === "available")

  return (
    <main className="mx-auto max-w-page space-y-8 px-6 py-12">
      <CompanyHeader
        {...companyHeaderProps(company)}
        companyId={companyId}
        current="integrations"
      >
        <IntegrationGroup
          title={t("connectedGroup")}
          rows={[
            ...rows.filter((row) => row.state === "broken"),
            ...rows.filter((row) => row.state === "connected"),
          ]}
        />
        <IntegrationGroup
          title={t("messagingGroup")}
          rows={available("messaging")}
        />
        <IntegrationGroup
          title={t("apiAiAppsGroup")}
          keepCase
          rows={available("api")}
        />
        <IntegrationGroup
          title={t("atsGroup")}
          keepCase
          rows={available("ats")}
        />
        {!integrations?.available && (
          <p className={`${CARD} text-muted-foreground`}>
            {/* Not loaded (its service failed), or not offered yet. */}
            {integrations === null ? t("connectionsFailed") : t("unavailable")}
          </p>
        )}
      </CompanyHeader>
    </main>
  )
}
