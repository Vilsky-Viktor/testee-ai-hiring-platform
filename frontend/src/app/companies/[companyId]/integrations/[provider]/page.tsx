import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { BackLink } from "@/components/common/back-link"
import {
  AtsActions,
  AtsStatus,
} from "@/features/company/components/ats-connection"
import { AtsFlow } from "@/features/company/components/ats-flow"
import { AtsJobLinks } from "@/features/company/components/ats-job-links"
import { PageHeader } from "@/components/common/page-header"
import { ShortNumber } from "@/components/common/short-number"
import { SignInPrompt } from "@/components/common/sign-in-prompt"
import { SummaryCards } from "@/components/common/summary-cards"
import { WarningCard } from "@/components/common/warning-card"
import { ATS_PROVIDERS, type AtsProvider } from "@/config/ats"
import { TOKEN_COOKIE } from "@/config/auth"
import { serverFetch } from "@/lib/server-api"
import type {
  AtsConnection,
  AtsIntegrations,
  AtsJobLink,
  Company,
  Interview,
} from "@/types/company"

type Params = Promise<{ companyId: string; provider: string }>

function providerOf(id: string) {
  return ATS_PROVIDERS.find((item) => item.id === id)
}

export const generateMetadata = async ({ params }: { params: Params }) => ({
  title: providerOf((await params).provider)?.name,
})

/** An ATS's own page, laid out like an interview's: back to the integrations tab, its status and
 * "⋮" menu; once connected, how it stands (with a warning and Reconnect when it stopped working);
 * how candidates flow; and its linked jobs, or before it's connected a large Connect. */
export default async function AtsPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: Promise<{ setup?: string }>
}) {
  const { companyId, provider: id } = await params
  const setup = Boolean((await searchParams).setup)
  const provider = providerOf(id)

  if (!provider) {
    notFound()
  }

  const signedIn = (await cookies()).has(TOKEN_COOKIE)
  const t = await getTranslations("company")
  // Asked together: the API refuses each on its own when the company isn't theirs.
  const [company, integrations, links, interviews] = signedIn
    ? await Promise.all([
        serverFetch<Company>(`/companies/companies/${companyId}`),
        serverFetch<AtsIntegrations>(
          `/ats/connections?company_id=${companyId}`
        ),
        serverFetch<AtsJobLink[]>(`/ats/links?company_id=${companyId}`),
        serverFetch<Interview[]>(
          `/companies/interviews?company_id=${companyId}&limit=100`
        ),
      ])
    : [null, null, null, null]

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

  if (!integrations?.available) {
    notFound()
  }

  const connection =
    integrations.connections.find((item) => item.provider === provider.id) ??
    null
  const connected = connection?.status === "connected"
  const own = (links ?? []).filter((item) => item.provider === provider.id)

  return (
    <main className="mx-auto max-w-page space-y-8 px-6 py-12">
      <PageHeader
        back={
          <BackLink href={`/companies/${companyId}/integrations`} help="ats">
            {t("integrations")}
          </BackLink>
        }
        title={
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={provider.logo}
                alt=""
                className="size-12 shrink-0 rounded-xl"
              />
              <h1 className="min-w-0 font-heading text-3xl font-medium tracking-tight normal-case">
                {provider.name}
              </h1>
            </div>
            <AtsActions
              companyId={companyId}
              provider={provider}
              connection={connection}
              canEdit={company.can_edit}
              only="menu"
              key={String(setup)}
              setup={setup}
            />
          </div>
        }
      />
      {connection && (
        <AtsOverview
          companyId={companyId}
          companyName={company.name}
          provider={provider}
          connection={connection}
          links={own}
          canEdit={company.can_edit}
        />
      )}
      <AtsFlow provider={provider} />
      {connection ? (
        <AtsJobLinks
          companyId={companyId}
          provider={provider}
          links={own}
          interviews={(interviews ?? []).filter((item) => item.set_id)}
          canEdit={company.can_edit && connected}
        />
      ) : (
        <div className="mx-auto max-w-xl" data-testid="ats-start">
          <AtsActions
            companyId={companyId}
            provider={provider}
            connection={connection}
            canEdit={company.can_edit}
            only="connect"
            connectClassName="h-14 w-full text-lg"
          />
        </div>
      )}
    </main>
  )
}

/** How a connection stands: its facts, and a warning with Reconnect when it stopped working. */
async function AtsOverview({
  companyId,
  companyName,
  provider,
  connection,
  links,
  canEdit,
}: {
  companyId: string
  companyName: string
  provider: AtsProvider
  connection: AtsConnection
  links: AtsJobLink[]
  canEdit: boolean
}) {
  const ats = await getTranslations("ats")
  const invited = links.reduce((total, link) => total + link.invited, 0)

  return (
    <>
      <SummaryCards
        testId="ats-summary"
        className="lg:grid-cols-4"
        rows={[
          {
            id: "status",
            label: ats("summary.status"),
            value: <AtsStatus connection={connection} />,
          },
          {
            id: "account",
            label: ats("summary.account"),
            value: connection.account || companyName,
          },
          {
            id: "jobs",
            label: ats("summary.jobs"),
            value: <ShortNumber value={links.length} />,
          },
          {
            id: "invited",
            label: ats("summary.invited"),
            value: <ShortNumber value={invited} />,
          },
        ]}
      />
      {connection.status === "broken" && (
        <WarningCard
          className="max-sm:-mx-6 max-sm:flex-wrap max-sm:rounded-none"
          action={
            <AtsActions
              companyId={companyId}
              provider={provider}
              connection={connection}
              canEdit={canEdit}
              only="connect"
            />
          }
        >
          {ats("brokenText", { ats: provider.name })}
        </WarningCard>
      )}
    </>
  )
}
