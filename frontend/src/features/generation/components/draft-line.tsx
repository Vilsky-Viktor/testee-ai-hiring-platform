"use client"

import { useDraft } from "@/hooks/use-draft"

/** The start of the job description the interview is being made from, on one line. */
export function DraftLine() {
  const draft = useDraft()

  if (!draft) {
    return null
  }

  return (
    <p
      dir="auto"
      data-testid="draft-line"
      className="truncate text-muted-foreground"
    >
      {draft.text}
    </p>
  )
}
