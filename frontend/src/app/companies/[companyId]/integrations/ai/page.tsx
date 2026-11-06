import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { BackLink } from "@/components/common/back-link"
import { AiAppsSetup } from "@/components/common/ai-apps-setup"
import { InfoCard } from "@/components/common/warning-card"
import { AiAppsPrompts } from "@/features/company/components/ai-apps-prompts"
import { DotsMenu } from "@/components/common/dots-menu"
import { AiAppsSwitch } from "@/features/company/components/ai-apps-switch"
import { ConnectedApps } from "@/features/company/components/connected-apps"
import { PageHeader } from "@/components/common/page-header"
import { SignInPrompt } from "@/components/common/sign-in-prompt"
import { Badge } from "@/components/ui/badge"
import { MCP_DOCS_PATH, MCP_MARK } from "@/config/ai-apps"
import { TOKEN_COOKIE } from "@/config/auth"
import { serverFetch } from "@/lib/server-api"
import type { Company } from "@/types/company"
import type { AiConnection } from "@/types/connections"

export const generateMetadata = async () => ({
  title: (await getTranslations("aiApps"))("title"),
})

/** AI apps' page, laid out like Slack's: back to the integrations tab, the title and whether
 * any app is connected; how to add testee to Claude and ChatGPT; the user's connected apps.
 * Connections are the user's own, so every company shows the same ones, to everyone in it. */
export default async function AiAppsPage({
  params,
}: {
  params: Promise<{ companyId: string }>
}) {
  const { companyId } = await params
  const signedIn = (await cookies()).has(TOKEN_COOKIE)
  const t = await getTranslations("company")
  const ai = await getTranslations("aiApps")
  const ats = await getTranslations("ats")
  const api = await getTranslations("api")
  // Asked together: the connections are the person's own.
  const [company, connections] = signedIn
    ? await Promise.all([
        serverFetch<Company>(`/companies/companies/${companyId}`),
        serverFetch<AiConnection[]>("/assistant/connections").then(
          (rows) => rows ?? []
        ),
      ])
    : [null, []]

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

  return (
    <main className="mx-auto max-w-page space-y-8 px-6 py-12">
      <PageHeader
        back={
          <BackLink href={`/companies/${companyId}/integrations`} help="aiApps">
            {t("integrations")}
          </BackLink>
        }
        title={
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={MCP_MARK}
                  alt=""
                  className="size-6 dark:brightness-0 dark:invert"
                />
              </span>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="font-heading text-3xl font-medium tracking-tight normal-case">
                    {ai("title")}
                  </h1>
                  {connections.length > 0 && (
                    <Badge className="h-8 shrink-0 px-4 text-sm font-light max-sm:hidden">
                      {ats("statusConnected")}
                    </Badge>
                  )}
                </div>
                {/* On phones "connected" goes under the title and subtitle. */}
                {connections.length > 0 && (
                  <Badge className="mt-2 h-8 px-4 text-sm font-light sm:hidden">
                    {ats("statusConnected")}
                  </Badge>
                )}
              </div>
            </div>
            <DotsMenu
              items={[{ label: api("docs"), href: MCP_DOCS_PATH }]}
            />
          </div>
        }
      />
      <InfoCard className="max-sm:-mx-6 max-sm:rounded-none">
        {ai("subtitle")}
      </InfoCard>
      <AiAppsSwitch
        companyId={companyId}
        companyName={company.name}
        allowed={company.ai_apps_allowed ?? true}
        canEdit={company.can_edit}
      />
      {connections.length > 0 && (
        <>
          <ConnectedApps connections={connections} />
          <AiAppsPrompts />
        </>
      )}
      <AiAppsSetup />
    </main>
  )
}
