"use client"

import { cn } from "cn"

import { Caret } from "@/components/common/caret"
import { SUBTOPIC_TAG_SMALL } from "@/components/common/subtopic-list"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

// A name edited in place: its own field look, set close around the text.
const IN_PLACE =
  "-mx-3 -my-1 inline-block rounded-lg px-3 py-1 transition-colors"

/** A topic as the topic review shows it (features/generation/components/topic-review.tsx),
 * simplified for the promo, as a row of its list: ticked, its name and its subtopics under it. Its name
 * (the pointer's "edit" while `aimed`) and the subtopic at `subtopic` (the pointer's "subtopic"),
 * are edited in place: the one `editing` ("name" or "subtopic") shows as a field with a caret. */
export function TopicCard({
  name,
  subtopics,
  aimed = false,
  subtopic,
  editing = null,
}: {
  name: string
  subtopics: string[]
  aimed?: boolean
  // The place of the subtopic edited in place.
  subtopic?: number
  editing?: string | null
}) {
  function field(text: string, key: string, target?: string) {
    return (
      <span
        data-demo-target={aimed ? target : undefined}
        className={cn(
          IN_PLACE,
          // Being typed in: highlighted, without a border.
          editing === key && "bg-surface"
        )}
      >
        {text}
        {editing === key && <Caret />}
      </span>
    )
  }

  return (
    <span className="flex items-center gap-4 px-5 py-4">
      <Checkbox
        checked
        className="size-6 shrink-0 [&_[data-slot=checkbox-indicator]>svg]:size-4"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-base font-medium">
          {field(name, "name", "edit")}
        </span>
        {/* The site's subtopic tags; the one edited in place highlighted as it's typed in. */}
        <span className="flex flex-wrap gap-2">
          {subtopics.map((item, position) => {
            const edited = position === subtopic

            return (
              <Badge
                key={position}
                variant="outline"
                data-demo-target={edited && aimed ? "subtopic" : undefined}
                className={cn(
                  SUBTOPIC_TAG_SMALL,
                  edited && editing === "subtopic" && "bg-surface"
                )}
              >
                {item}
                {edited && editing === "subtopic" && <Caret />}
              </Badge>
            )
          })}
        </span>
      </span>
    </span>
  )
}
