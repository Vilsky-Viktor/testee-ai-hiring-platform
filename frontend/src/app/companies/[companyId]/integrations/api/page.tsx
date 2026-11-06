import { CodeXmlIcon } from "lucide-react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { BackLink } from "@/components/common/back-link"
import { AllowedDomains } from "@/features/company/components/allowed-domains"
import { ApiNav, type ApiTab } from "@/features/company/components/api-nav"
import { ApiKeys, NewKey } from "@/features/company/components/api-keys"
import {
  AddWebhook,
  ApiWebhooks,
} from "@/features/company/components/api-webhooks"
import { DotsMenu } from "@/components/common/dots-menu"
import { PageHeader } from "@/components/common/page-header"
import { SignInPrompt } from "@/components/common/sign-in-prompt"
import { API_DOCS_PATH, SDK_DOCS_PATH } from "@/config/api"
import { TOKEN_COOKIE } from "@/config/auth"
import { serverFetch } from "@/lib/server-api"
import type { ApiSettings } from "@/types/api-access"
import type { Company } from "@/types/company"

export const generateMetadata = async () => ({
  title: (await getTranslations("api"))("name"),
})

/** The API's own page, laid out like an interview's: back to the integrations tab, its name, the
 * docs and the open tab's action; then three tabs, the company's keys, its web hooks and its
 * allowed domains. */
export default async function ApiPage({
  params,
  searchParams,
}: {
  params: Promise<{ companyId: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { companyId } = await params
  const tab = (await searchParams).tab
  const current: ApiTab = tab === "webhooks" || tab === "domains" ? tab : "keys"
  const href = `/companies/${companyId}/integrations/api`
  const signedIn = (await cookies()).has(TOKEN_COOKIE)
  const t = await getTranslations("company")
  const api = await getTranslations("api")
  // Asked together: the API refuses the settings on its own when the company isn't theirs.
  const [company, settings] = signedIn
    ? await Promise.all([
        serverFetch<Company>(`/companies/companies/${companyId}`),
        serverFetch<ApiSettings>(`/v1/manage?company_id=${companyId}`),
      ])
    : [null, null]

  if (!signedIn) {
    return (
      <main className="mx-auto max-w-page px-6 py-12">
        <SignInPrompt />
      </main>
    )
  }

  if (!company || !settings) {
    redirect("/companies")
  }

  return (
    <main className="mx-auto max-w-page space-y-8 px-6 py-12">
      <div className="space-y-6">
        <PageHeader
          back={
            <BackLink href={`/companies/${companyId}/integrations`} help="api">
              {t("integrations")}
            </BackLink>
          }
          title={
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-surface">
                  <CodeXmlIcon className="size-6" />
                </span>
                <div className="min-w-0 space-y-1">
                  <h1 className="font-heading text-3xl font-medium tracking-tight normal-case">
                    {api("name")}
                  </h1>
                </div>
              </div>
              {/* The open tab's action for owners and admins, and the docs in the "⋮" menu. */}
              <div
                className="flex shrink-0 items-center justify-end gap-3"
                data-testid="integration-actions"
              >
                {company.can_edit && (
                  <TabAction
                    current={current}
                    companyId={companyId}
                    settings={settings}
                  />
                )}
                <DotsMenu
                  items={[
                    current === "domains"
                      ? { label: api("sdkDocs"), href: SDK_DOCS_PATH }
                      : { label: api("docs"), href: API_DOCS_PATH },
                  ]}
                />
              </div>
            </div>
          }
        />
        <ApiNav href={href} current={current}>
          {current === "keys" ? (
            <ApiKeys
              companyId={companyId}
              keys={settings.keys}
              expiries={settings.expiries}
              options={settings}
              defaults={settings.default_permissions}
              canEdit={company.can_edit}
            />
          ) : current === "webhooks" ? (
            <ApiWebhooks
              companyId={companyId}
              webhooks={settings.webhooks}
              canEdit={company.can_edit}
            />
          ) : (
            <AllowedDomains
              companyId={companyId}
              domains={company.allowed_domains ?? []}
              allowLocalhost={company.allow_localhost ?? false}
              canEdit={company.can_edit}
            />
          )}
        </ApiNav>
      </div>
    </main>
  )
}

/** The open tab's main action, in the title row: none until the tab has something listed, as its
 * empty state has it then. */
function TabAction({
  current,
  companyId,
  settings,
}: {
  current: ApiTab
  companyId: string
  settings: ApiSettings
}) {
  if (current === "keys" && settings.keys.length > 0) {
    return (
      <NewKey
        companyId={companyId}
        expiries={settings.expiries}
        options={settings}
        defaults={settings.default_permissions}
      />
    )
  }

  if (current === "webhooks" && settings.webhooks.length > 0) {
    return <AddWebhook companyId={companyId} />
  }

  return null
}
