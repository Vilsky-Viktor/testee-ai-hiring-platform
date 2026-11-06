import { KeyRoundIcon } from "lucide-react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { BackLink } from "@/components/common/back-link"
import { EditableTitle } from "@/components/common/editable-title"
import { PageHeader } from "@/components/common/page-header"
import { WarningCard } from "@/components/common/warning-card"
import { SignInPrompt } from "@/components/common/sign-in-prompt"
import { ActionList } from "@/features/company/components/action-list"
import { KeyMenu, NewKey } from "@/features/company/components/api-keys"
import { KeyIps } from "@/features/company/components/key-ips"
import {
  KeyPermissions,
  PermissionTags,
} from "@/features/company/components/api-permissions"
import { KeySummary } from "@/features/company/components/key-summary"
import { TOKEN_COOKIE } from "@/config/auth"
import { MAX_KEY_NAME } from "@/config/api"
import { PAGE_SIZE } from "@/config/lists"
import { optionalFetch, serverFetch } from "@/lib/server-api"
import type { ApiSettings } from "@/types/api-access"
import type { Company, CompanyAction } from "@/types/company"

export const generateMetadata = async () => ({
  title: (await getTranslations("api"))("keysTitle"),
})

/** An API key's own page, laid out like an integration's: back to the API page, its name, edited
 * in place, and a "⋮" menu with Delete for owners and admins; how it stands, with a warning and
 * a replacement when it's expired or about to; its permissions and allowed IPs; and for the owner
 * what it did. */
export default async function ApiKeyPage({
  params,
}: {
  params: Promise<{ companyId: string; keyId: string }>
}) {
  const { companyId, keyId } = await params
  const apiHref = `/companies/${companyId}/integrations/api`
  const signedIn = (await cookies()).has(TOKEN_COOKIE)
  const api = await getTranslations("api")
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

  // A key that's gone (deleted here or elsewhere) leads back to the list.
  const apiKey = settings.keys.find((key) => key.id === keyId)

  if (!apiKey) {
    redirect(apiHref)
  }

  const warned = ["expired", "expiring"].includes(apiKey.state)
  const activityPath = `/companies/companies/${companyId}/actions?key_id=${apiKey.id}`
  const activity = company.can_see_actions
    ? await optionalFetch<CompanyAction[]>(`${activityPath}&limit=${PAGE_SIZE}`)
    : null

  return (
    <main className="mx-auto max-w-page space-y-8 px-6 py-12">
      <PageHeader
        back={
          <BackLink href={apiHref} help="api">
            {api("name")}
          </BackLink>
        }
        title={
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-surface">
                <KeyRoundIcon className="size-6" />
              </span>
              <div className="min-w-0 space-y-1">
                <EditableTitle
                  title={apiKey.name}
                  path={`/v1/manage/keys/${apiKey.id}/name?company_id=${companyId}`}
                  field="name"
                  maxLength={MAX_KEY_NAME}
                  editable={company.can_edit}
                  label={api("keyName")}
                />
                <code className="text-sm text-muted-foreground">
                  {apiKey.shown}…
                </code>
              </div>
            </div>
            {company.can_edit && (
              <KeyMenu companyId={companyId} apiKey={apiKey} />
            )}
          </div>
        }
      />
      <KeySummary apiKey={apiKey} />
      {warned && (
        <WarningCard
          className="max-sm:-mx-6 max-sm:flex-wrap max-sm:rounded-none"
          action={
            company.can_edit && (
              <NewKey
                companyId={companyId}
                expiries={settings.expiries}
                options={settings}
                defaults={settings.default_permissions}
                copyOf={apiKey}
                label={api("replaceKey")}
              />
            )
          }
        >
          {api(
            apiKey.state === "expired"
              ? "warnings.expired"
              : "warnings.expiring"
          )}
        </WarningCard>
      )}
      {/* Its permissions, and its allowed IPs beside them; stacked on smaller screens. */}
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        <section className="space-y-4">
          <h2 className="font-heading text-2xl font-medium">
            {api("permissionsTitle")}
          </h2>
          <p className="text-base text-muted-foreground">
            {api("permissionsText")}
          </p>
          {company.can_edit ? (
            <KeyPermissions
              companyId={companyId}
              apiKey={apiKey}
              options={settings}
            />
          ) : (
            <PermissionTags
              permissions={apiKey.permissions}
              groups={settings.permission_groups}
            />
          )}
        </section>
        <section className="space-y-4">
          <h2 className="font-heading text-2xl font-medium">
            {api("allowedIps")}
          </h2>
          <p className="text-base text-muted-foreground" data-testid="key-ips">
            {apiKey.allowed_ips.length
              ? api("ipCount", { count: apiKey.allowed_ips.length })
              : api("ipOpen")}
          </p>
          <KeyIps
            companyId={companyId}
            apiKey={apiKey}
            canEdit={company.can_edit}
          />
        </section>
      </div>
      {/* What it did: from the company's action log, which only its owner reads. */}
      {company.can_see_actions && (
        <section className="space-y-4">
          <h2 className="font-heading text-2xl font-medium">
            {api("activityTitle")}
          </h2>
          <ActionList
            path={activityPath}
            initial={activity ?? []}
            companyId={companyId}
          />
        </section>
      )}
    </main>
  )
}
