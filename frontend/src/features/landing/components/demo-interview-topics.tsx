"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"

import { SubtopicList } from "@/components/common/subtopic-list"
import { TopicsHeader } from "@/components/common/topic-limit"
import { FloatingInput } from "@/components/ui/floating-field"
import { LIST_BOX } from "@/config/lists"

/** An interview's topics (features/company/components/interview-topics.tsx), simplified for the
 * promo: each topic's name and subtopics, and how many of its `count` questions each candidate
 * gets in the site's field (`limits`, by the topic's name), in use while `focused` and with its
 * green check once `saved`. A topic none are asked from fades back. A changed topic's number is
 * `limit<n>` for the pointer, n its place in `changed`. The rows slide in one by one as the page
 * shows. */
export function DemoInterviewTopics({
  topics,
  count,
  limits,
  changed,
  focused,
  saved,
}: {
  topics: { name: string; subtopics: string[] }[]
  count: number
  limits: Record<string, number>
  changed: string[]
  focused: string | null
  saved: string | null
}) {
  const t = useTranslations("questions")
  const common = useTranslations("common")

  return (
    <ul data-stagger className={`${LIST_BOX} overflow-hidden`}>
      <TopicsHeader className="px-5" />
      {topics.map((topic) => {
        const target = changed.indexOf(topic.name)
        const limit = limits[topic.name]

        return (
          <li
            key={topic.name}
            className={cn(
              "flex items-center justify-between gap-4 px-5 py-6 transition-opacity",
              limit === 0 && focused !== topic.name && "opacity-40"
            )}
          >
            <span className="min-w-0 space-y-1.5">
              <span className="block text-base font-medium">{topic.name}</span>
              <SubtopicList subtopics={topic.subtopics} small />
            </span>
            <span className="relative shrink-0">
              <FloatingInput
                plain
                label={t("perCandidate")}
                suffix={t("ofCount", { count })}
                saved={saved === topic.name ? common("saved") : null}
                caret={focused === topic.name}
                value={limit}
                readOnly
                boxClassName={cn(
                  "count-field mt-0 w-26 [&>span:not(.sr-only)]:end-3 [&>span:not(.sr-only)]:mt-0 [&>span:not(.sr-only)]:text-sm",
                  focused === topic.name && "border-ring-gradient"
                )}
                style={{
                  paddingInlineStart: "0.875rem",
                  paddingInlineEnd: "3rem",
                }}
                className="h-10 pt-1 text-sm tabular-nums md:text-sm"
              />
              {/* Just after the number: where the pointer clicks and stays, leaving it in view. */}
              <span
                aria-hidden
                className="pointer-events-none absolute start-[0.9375rem] top-0 flex h-10 items-center text-sm tabular-nums"
              >
                <span className="invisible">{limit}</span>
                <span
                  data-demo-target={target < 0 ? undefined : `limit${target}`}
                  className="ms-2.5 size-px"
                />
              </span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}
