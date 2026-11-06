import { cn } from "cn"
import { ClipboardPasteIcon } from "lucide-react"

import { DEMO_PRESSED } from "@/features/landing/components/demo-panel"

/** A right-click menu over an empty field, in the site's menu look
 * (components/ui/dropdown-menu.tsx), its top corner at where it was opened: just paste (`label`),
 * highlighted (`paste`, for the pointer). Shown while `open`. */
export function DemoPasteMenu({
  open,
  pressed,
  label,
}: {
  open: boolean
  // Paste, as the pointer clicks it.
  pressed: boolean
  label: string
}) {
  return (
    <span
      data-demo-menu
      data-open={open}
      className={cn(
        "absolute start-1 top-1 z-5 flex min-w-36 origin-top-left flex-col rounded-xl bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 transition-[opacity,scale] duration-100 rtl:origin-top-right",
        !open && "invisible scale-95 opacity-0"
      )}
    >
      <span
        data-demo-target="paste"
        className={cn(
          "flex items-center gap-2 rounded-lg bg-surface px-2.5 py-2 text-base transition-all",
          pressed && DEMO_PRESSED
        )}
      >
        <ClipboardPasteIcon className="size-4 shrink-0" />
        {label}
      </span>
    </span>
  )
}
