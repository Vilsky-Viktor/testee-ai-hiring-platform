"use client"

import { useTranslations } from "next-intl"

import { SummaryCards } from "@/components/common/summary-cards"
import { KeyState } from "@/features/company/components/api-keys"
import { useLocalTime } from "@/hooks/use-local-time"
import type { ApiKey } from "@/types/api-access"

/** A key at a glance: how it stands, what it may do, and its dates, each in a card. */
export function KeySummary({ apiKey }: { apiKey: ApiKey }) {
  const t = useTranslations("api")
  const localTime = useLocalTime()

  return (
    <SummaryCards
      testId="key-summary"
      rows={[
        {
          id: "status",
          label: t("summary.status"),
          value: <KeyState apiKey={apiKey} />,
        },
        {
          id: "access",
          label: t("summary.access"),
          value: t(`access.${apiKey.access}`),
        },
        {
          id: "lastUsed",
          label: t("summary.lastUsed"),
          value: apiKey.last_used_at
            ? localTime.date(apiKey.last_used_at)
            : t("neverUsed"),
        },
        {
          id: "expires",
          label: t("summary.expires"),
          value: apiKey.expires_at
            ? localTime.date(apiKey.expires_at)
            : t("neverExpires"),
        },
        {
          id: "created",
          label: t("summary.created"),
          value: localTime.date(apiKey.created_at),
        },
      ]}
    />
  )
}
