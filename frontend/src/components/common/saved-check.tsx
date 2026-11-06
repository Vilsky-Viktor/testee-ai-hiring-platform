import { cn } from "cn"
import { CheckCheckIcon } from "lucide-react"

/** What shows that a setting saved itself, where there's no Save button: a green check for a
 * moment, in a box that keeps its room so nothing moves, and `text` for screen readers, in a live
 * region that's there before it. Null shows nothing yet; undefined, a control that doesn't save
 * itself, renders nothing at all. */
export function SavedCheck({
  text,
  className,
}: {
  text: string | null | undefined
  className?: string
}) {
  if (text === undefined) {
    return null
  }

  return (
    <span className={cn("flex size-6 shrink-0", className)}>
      <span role="status" className="sr-only">
        {text}
      </span>
      {text && (
        <CheckCheckIcon
          aria-hidden
          data-testid="field-saved"
          className="size-6 animate-in text-green-700 duration-200 zoom-in-50 fade-in motion-reduce:animate-none dark:text-green-400"
        />
      )}
    </span>
  )
}
