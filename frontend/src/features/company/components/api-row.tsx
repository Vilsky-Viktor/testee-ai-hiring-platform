"use client"

import { CodeXmlIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { DotsMenu } from "@/components/common/dots-menu"
import { IntegrationRow } from "@/features/company/components/integration-row"
import { DottedText } from "@/components/common/dot"
import { API_DOCS_PATH } from "@/config/api"
import { INTEGRATION_ACTIONS } from "@/config/lists"
import type { ApiSettings } from "@/types/api-access"

/** The API's row on the integrations tab: its mark, name, and how many keys and web hooks the
 * company has; the row opens the API page, the docs button sits on top. */
export function ApiRow({
  companyId,
  settings,
}: {
  companyId: string
  settings: ApiSettings
}) {
  const t = useTranslations("api")
  const inUse = settings.keys.length > 0

  return (
    <IntegrationRow
      href={`/companies/${companyId}/integrations/api`}
      logo={<CodeXmlIcon className="size-10 max-sm:size-6" />}
      name={t("rowName")}
      text={
        inUse ? (
          <DottedText
            text={t("counts", {
              keys: settings.keys.length,
              webhooks: settings.webhooks.length,
            })}
          />
        ) : (
          t("rowText")
        )
      }
      actions={
        <span className={INTEGRATION_ACTIONS}>
          <DotsMenu
            items={[{ label: t("docs"), href: API_DOCS_PATH }]}
          />
        </span>
      }
    />
  )
}
