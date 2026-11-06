import { Badge } from "@/components/ui/badge"

// A subtopic's pill, and the same a size down, for the landing's previews.
export const SUBTOPIC_TAG =
  "h-8 px-4 text-sm font-light text-muted-foreground normal-case"
export const SUBTOPIC_TAG_SMALL =
  "h-7 px-3 text-sm font-light text-muted-foreground normal-case"

/** A topic's subtopics as quiet pills, every one of them; `small` a size down. */
export function SubtopicList({
  subtopics,
  small = false,
}: {
  subtopics: string[]
  small?: boolean
}) {
  if (subtopics.length === 0) {
    return null
  }

  return (
    <span className="flex flex-wrap gap-2">
      {subtopics.map((subtopic) => (
        <Badge
          key={subtopic}
          variant="outline"
          className={small ? SUBTOPIC_TAG_SMALL : SUBTOPIC_TAG}
        >
          {subtopic}
        </Badge>
      ))}
    </span>
  )
}
