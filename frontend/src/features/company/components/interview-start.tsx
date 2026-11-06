import { ArrowRightIcon } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

import { PausedNotice } from "@/components/common/paused-notice"
import { LIST_BOX, ROW_HOVER } from "@/config/lists"
import { NewInterview } from "@/features/company/components/new-interview"
import { optionalFetch } from "@/lib/server-api"
import type { AtsIntegrations } from "@/types/company"

/** Starting a company's interview: what happens, the job description box, and the other ways to
 * start, from a template, or from a job in its ATS once one is connected. */
export async function InterviewStart({
  companyId,
  paused,
}: {
  companyId: string
  paused: boolean
}) {
  const t = await getTranslations("interviews")
  const ats = await optionalFetch<AtsIntegrations>(
    `/ats/connections?company_id=${companyId}`
  )
  const [connected] = ats?.connections ?? []
  const base = `/companies/${companyId}`
  const others = [
    { href: `${base}/templates`, label: t("startTemplate") },
    ...(connected
      ? [
          {
            href: `${base}/integrations/${connected.provider}`,
            label: t("startAts"),
          },
        ]
      : []),
  ]

  return (
    <div className="space-y-6">
      <p className="text-lg text-balance text-muted-foreground">{t("createIntro")}</p>
      <PausedNotice paused={paused} />
      {/* While paused, nothing can be generated: the box is there but off. */}
      <NewInterview companyId={companyId} disabled={paused} />
      <div className={`${LIST_BOX} overflow-hidden`}>
        {others.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center justify-between gap-4 px-6 py-4 text-base ${ROW_HOVER}`}
          >
            {label}
            <ArrowRightIcon
              aria-hidden
              className="size-5 shrink-0 text-muted-foreground rtl:-scale-x-100"
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
