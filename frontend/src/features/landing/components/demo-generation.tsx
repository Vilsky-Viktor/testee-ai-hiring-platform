"use client"

import { useTranslations } from "next-intl"

import { AiPulse } from "@/components/common/ai-pulse"
import { WritingProgress } from "@/components/common/writing-progress"

/** The questions being written, simplified for the promo: testee's loading mark floating over
 * the generation page's title and the real progress (components/common/writing-progress.tsx),
 * the `topics` listed and the first `ready` of them done. Starts afresh each round. */
export function DemoGeneration({
  topics,
  ready,
}: {
  topics: string[]
  ready: number
}) {
  const t = useTranslations("generation")

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <span data-float>
        <AiPulse className="size-24" />
      </span>
      <p className="font-heading text-5xl font-medium tracking-tight text-balance">
        {t("writing")}
      </p>
      <WritingProgress
        key={ready === 0 ? "start" : "writing"}
        progress={{
          done: ready,
          total: topics.length,
          topics: topics.length,
          topics_ready: ready,
          topic_states: topics.map((name, place) => ({
            name,
            ready: place < ready,
          })),
        }}
      />
    </div>
  )
}
