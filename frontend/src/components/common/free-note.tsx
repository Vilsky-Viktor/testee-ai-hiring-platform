import { GiftIcon } from "lucide-react"

/** A small line telling of the free candidates, with a gift. */
export function FreeNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <GiftIcon aria-hidden className="size-4 shrink-0 text-primary" />
      {children}
    </p>
  )
}
