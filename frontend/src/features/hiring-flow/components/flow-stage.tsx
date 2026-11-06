import { cn } from "cn"
import { getTranslations } from "next-intl/server"

import { FeatureShot } from "@/components/common/feature-shot"
import { FlowBranches } from "@/features/hiring-flow/components/flow-branches"
import { FlowReveal } from "@/features/hiring-flow/components/flow-reveal"
import type { FlowStage } from "@/config/hiring-flow"

// What comes in as a stage is scrolled to: from a little lower, and from its side.
const COME_IN =
  "transition-[opacity,translate] duration-700 ease-out group-data-ready/flow:not-group-data-shown/flow:translate-y-8 group-data-ready/flow:not-group-data-shown/flow:opacity-0"

/** One stage of the flow: its node on the line (its icon, lit once seen), its title, text and
 * options on one side and the picture of the real app on the other, sides taking turns from
 * tablets up; on phones, all after the node at the start edge. A stage with `branches` ends with
 * the line fanning out into them. */
export async function FlowStageRow({
  stage,
  number,
}: {
  stage: FlowStage
  number: number
}) {
  const tf = await getTranslations("hiringFlow")
  // A stage's own texts; its points and branches are named in its config (config/hiring-flow.ts).
  const t = (key: string) =>
    tf(`stages.${stage.key}.${key}` as Parameters<typeof tf>[0])
  const flipped = number % 2 === 0
  const Icon = stage.icon

  return (
    <FlowReveal className="relative py-12 md:py-20">
      <div className="grid grid-cols-[3rem_1fr] gap-x-6 gap-y-8 md:grid-cols-[1fr_4rem_1fr] md:gap-x-10">
        <div className="relative z-10 row-span-2 flex justify-center md:col-start-2 md:row-span-1 md:row-start-1">
          <span className="flex size-12 items-center justify-center rounded-full border-2 bg-background text-muted-foreground transition-[color,border-color,scale] delay-200 duration-500 group-data-shown/flow:scale-110 group-data-shown/flow:border-primary group-data-shown/flow:text-primary md:size-16">
            <Icon aria-hidden className="size-5 md:size-7" />
          </span>
        </div>
        <div
          className={cn(
            COME_IN,
            "space-y-4 md:row-start-1 md:self-center",
            flipped ? "md:col-start-3" : "md:col-start-1 md:text-end"
          )}
        >
          <p className="text-sm font-medium text-primary">
            {tf("step", { number })}
          </p>
          <h2 className="font-heading text-3xl font-medium tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("text")}</p>
          <ul
            className={cn("flex flex-wrap gap-2", !flipped && "md:justify-end")}
          >
            {stage.points.map((point, index) => (
              <li
                key={point}
                style={{ transitionDelay: `${300 + index * 80}ms` }}
                className="rounded-full bg-surface px-4 py-2 text-sm transition-[opacity,scale] duration-500 group-data-ready/flow:not-group-data-shown/flow:scale-90 group-data-ready/flow:not-group-data-shown/flow:opacity-0"
              >
                {t(`points.${point}`)}
              </li>
            ))}
          </ul>
        </div>
        {stage.shot && (
          <div
            className={cn(
              COME_IN,
              // On phones the picture keeps to its column beside the line, in its frame.
              "col-start-2 min-w-0 delay-150 max-sm:*:mx-0 max-sm:*:rounded-xl max-sm:*:border-x md:row-start-1 md:self-center",
              flipped ? "md:col-start-1" : "md:col-start-3"
            )}
          >
            <FeatureShot name={stage.shot} alt={t("alt")} />
          </div>
        )}
      </div>
      {stage.branches && (
        <FlowBranches
          label={tf("ways")}
          branches={stage.branches.map((branch) => ({
            ...branch,
            title: t(`branches.${branch.key}.title`),
            text: t(`branches.${branch.key}.text`),
          }))}
        />
      )}
    </FlowReveal>
  )
}
