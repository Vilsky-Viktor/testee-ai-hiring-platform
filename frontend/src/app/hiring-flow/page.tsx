import { getTranslations } from "next-intl/server"

import { FeaturesClosing } from "@/features/features/components/features-closing"
import { FlowHero } from "@/features/hiring-flow/components/flow-hero"
import { FlowLine } from "@/features/hiring-flow/components/flow-line"
import { FlowStageRow } from "@/features/hiring-flow/components/flow-stage"
import { PageKey } from "@/components/common/page-key"
import { FLOW_STAGES } from "@/config/hiring-flow"
import { visitorCatalog } from "@/lib/catalog"
import { pageMetadata } from "@/lib/site"

export async function generateMetadata() {
  const t = await getTranslations("hiringFlow")

  return pageMetadata(t("title"), t("description"), "/hiring-flow", true)
}

/** The whole hiring flow, top to bottom: from the job description to the hire, every stage a
 * node on one line that draws itself as the page scrolls, with every option at each stage and
 * pictures of the real app; the start box at the end, as on the features page. */
export default async function HiringFlowPage() {
  const catalog = await visitorCatalog()
  const freeCandidates = catalog?.free_candidates ?? null

  return (
    <div className="@container">
      <main className="mx-auto max-w-page px-6">
        <PageKey page="hiringFlow" />
        <FlowHero />
        <FlowLine>
          {FLOW_STAGES.map((stage, index) => (
            <FlowStageRow key={stage.key} stage={stage} number={index + 1} />
          ))}
        </FlowLine>
        <FeaturesClosing freeCandidates={freeCandidates} />
      </main>
    </div>
  )
}
