import { WebhookIcon } from "lucide-react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

import { BackLink } from "@/components/common/back-link"
import { PageHeader } from "@/components/common/page-header"
import { SignInPrompt } from "@/components/common/sign-in-prompt"
import { WarningCard } from "@/components/common/warning-card"
import { TOKEN_COOKIE } from "@/config/auth"
import {
  DeliveryLog,
  WebhookMenu,
  WebhookState,
  WebhookTest,
} from "@/features/company/components/webhook-actions"
import { optionalFetch, serverFetch } from "@/lib/server-api"
import type { ApiSettings, WebhookAttempt } from "@/types/api-access"
import type { Company } from "@/types/company"

export const generateMetadata = async () => ({
  title: (await getTranslations("api"))("webhooksTitle"),
})

/** A web hook's own page, laid out like an API key's: back to the API page, its address, how it
 * stands and, for owners and admins, the way to send it a test and a "⋮" menu; a warning while
 * it's paused, and its delivery log. */
export default async function WebhookPage({
  params,
}: {
  params: Promise<{ companyId: string; webhookId: string }>
}) {
  const { companyId, webhookId } = await params
  const apiHref = `/companies/${companyId}/integrations/api`
  const signedIn = (await cookies()).has(TOKEN_COOKIE)
  const api = await getTranslations("api")
  const [company, settings, attempts] = signedIn
    ? await Promise.all([
        serverFetch<Company>(`/companies/companies/${companyId}`),
        serverFetch<ApiSettings>(`/v1/manage?company_id=${companyId}`),
        optionalFetch<WebhookAttempt[]>(
          `/v1/manage/webhooks/${webhookId}/log?company_id=${companyId}`
        ),
      ])
    : [null, null, null]

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

  // A web hook that's gone (deleted here or elsewhere) leads back to the list.
  const hook = settings.webhooks.find((item) => item.id === webhookId)

  if (!hook) {
    redirect(`${apiHref}?tab=webhooks`)
  }

  return (
    <main className="mx-auto max-w-page space-y-8 px-6 py-12">
      <PageHeader
        back={
          <BackLink href={`${apiHref}?tab=webhooks`} help="api">
            {api("webhooksTitle")}
          </BackLink>
        }
        title={
          <div className="flex items-start justify-between gap-4 max-sm:flex-col max-sm:items-stretch">
            <div className="flex min-w-0 items-center gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-surface">
                <WebhookIcon className="size-6" />
              </span>
              <div className="min-w-0 space-y-2">
                <h1 className="font-heading text-2xl font-medium tracking-tight break-all normal-case">
                  {hook.url}
                </h1>
                <WebhookState hook={hook} />
              </div>
            </div>
            {company.can_edit && (
              <div className="flex min-w-0 items-center justify-end gap-3 max-sm:flex-wrap">
                <WebhookTest companyId={companyId} hookId={hook.id} />
                <WebhookMenu companyId={companyId} hook={hook} />
              </div>
            )}
          </div>
        }
      />
      {hook.state === "paused" && (
        <WarningCard className="max-sm:-mx-6 max-sm:rounded-none">
          {api("failing")}
        </WarningCard>
      )}
      <section className="space-y-4">
        <h2 className="font-heading text-2xl font-medium">{api("log")}</h2>
        <DeliveryLog attempts={attempts ?? []} />
      </section>
    </main>
  )
}
