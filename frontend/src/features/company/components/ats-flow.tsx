import { getTranslations } from "next-intl/server"

import type { AtsProvider } from "@/config/ats"

const STEPS = ["stripMove", "stripInvite", "stripResults"] as const

/** How candidates come and go, in three steps; the decisions stay with the company. */
export async function AtsFlow({ provider }: { provider: AtsProvider }) {
  const t = await getTranslations("ats")

  return (
    <section className="space-y-3" data-testid="ats-flow">
      <ol className="grid gap-3 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <li
            key={step}
            className="flex items-start gap-3 rounded-xl bg-surface p-4 text-base"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-input text-sm tabular-nums">
              {index + 1}
            </span>
            {t(step, { ats: provider.name })}
          </li>
        ))}
      </ol>
      <p className="text-sm text-muted-foreground">
        {t("flowDecide", { ats: provider.name })}
      </p>
    </section>
  )
}
