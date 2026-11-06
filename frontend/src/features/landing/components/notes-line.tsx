import { CheckIcon } from "lucide-react"

/** Short facts, each with a check, in centered rows that break between them. */
export function NotesLine({
  notes,
  testId = "notes",
}: {
  notes: string[]
  testId?: string
}) {
  return (
    <ul
      data-testid={testId}
      className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
    >
      {notes.map((note) => (
        <li key={note} className="flex items-center gap-1.5">
          <CheckIcon aria-hidden className="size-4 shrink-0 text-primary" />
          {note}
        </li>
      ))}
    </ul>
  )
}
