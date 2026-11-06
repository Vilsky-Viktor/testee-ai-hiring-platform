"use client"

import { cn } from "cn"
import { PlusIcon } from "lucide-react"
import { useTranslations } from "next-intl"

import { TopicCard } from "@/features/landing/components/topic-card"
import { DEMO_EDITED, DEMO_EDITED_SUBTOPIC } from "@/config/create-demo"
import { useDemoContent } from "@/features/landing/hooks/use-demo-content"

// A row flying in from the start side (promo-fly-in, promo.css).
const FLY_IN =
  "motion-safe:animate-[promo-fly-in_0.5s_cubic-bezier(0.2,0.9,0.3,1.2)_both] rtl:[--fly-from:1]"

/** The topic review's list (features/generation/components/topic-review.tsx), simplified for the
 * promo: the first `shown` topics, the edited one with its name and subtopic as typed so far
 * (`renamed`, `retyped`), lifted out of the list, a little larger, while one of them is
 * `editing` in place; the topic the AI added once `applied`, flashing in the primary colour. Each topic flies in as it shows. */
export function DemoTopicList({
  aimed = false,
  shown,
  applied,
  renamed,
  retyped,
  editing,
}: {
  // Whether its names are the pointer's targets.
  aimed?: boolean
  shown: number
  applied: boolean
  renamed: string
  retyped: string
  editing: string | null
}) {
  const t = useTranslations("generation")
  const content = useDemoContent("create")

  return (
    <ul className="divide-y rounded-xl border">
      {Object.values(content.topics)
        .slice(0, shown)
        .map((topic, place) => {
          if (place !== DEMO_EDITED) {
            return (
              <li key={topic.name} className={FLY_IN}>
                <TopicCard name={topic.name} subtopics={topic.subtopics} />
              </li>
            )
          }

          const subtopics = topic.subtopics.map((subtopic, position) =>
            position === DEMO_EDITED_SUBTOPIC ? subtopic + retyped : subtopic
          )

          return (
            <li
              key={topic.name}
              className={cn(
                "relative rounded-xl bg-background transition-[scale,box-shadow] duration-300",
                FLY_IN,
                editing && "z-10 scale-[1.03] ring-1 ring-ring"
              )}
            >
              <TopicCard
                name={topic.name + renamed}
                subtopics={subtopics}
                aimed={aimed}
                subtopic={DEMO_EDITED_SUBTOPIC}
                editing={editing}
              />
            </li>
          )
        })}
      {applied && (
        <li className="motion-safe:animate-[promo-fly-in_0.5s_cubic-bezier(0.2,0.9,0.3,1.2)_both,promo-flash_1.6s_ease-out_0.3s] rtl:[--fly-from:1]">
          <TopicCard
            name={content.newTopic.name}
            subtopics={content.newTopic.subtopics}
          />
        </li>
      )}
      <li className="flex items-center gap-4 px-5 py-3 font-medium text-primary lowercase">
        <PlusIcon aria-hidden className="size-6 shrink-0" />
        {t("addTopic")}
      </li>
    </ul>
  )
}
