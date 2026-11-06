import { cn } from "cn"
import type { ReactNode } from "react"
import { CheckIcon } from "lucide-react"

import { CompanyLogo } from "@/components/common/company-logo"
import { ROW_HOVER } from "@/config/lists"
import { firstGrapheme } from "@/lib/graphemes"

// A row whose logo fills its whole height from its start edge, and that logo.
export const FULL_LOGO_ROW = "py-0 ps-0 text-lg sm:ps-0"
export const FULL_LOGO = "size-20 rounded-none"

/** A row of the list asking which company an interview is for (features/generation/components/
 * company-picker.tsx, and the landing's create demo): grey on hover, up to its border's line, so the
 * line stays as it is. */
export const COMPANY_CHOICE_ROW = `flex w-full items-center gap-4 bg-clip-padding px-4 py-3 text-start text-base sm:px-5 ${ROW_HOVER}`

/** What such a row shows: the company's logo (its uploaded `logo`, a drawn `mark`, or else its
 * first letter), its name, and a check once `chosen`, or `aside` in its place (a balance);
 * `logoClassName` resizes the logo's tile, the hover's grey, solid, so the row's hover never changes
 * it and the two blend. The logo is decorative: the name says it. */
export function CompanyChoice({
  name,
  logo,
  mark,
  chosen = false,
  aside,
  logoClassName,
}: {
  name: string
  logo?: string | null
  mark?: ReactNode
  chosen?: boolean
  aside?: ReactNode
  logoClassName?: string
}) {
  return (
    <>
      <span
        aria-hidden
        className={cn(
          "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-(--surface-solid) text-muted-foreground",
          logoClassName
        )}
      >
        {mark ? (
          mark
        ) : logo ? (
          <CompanyLogo
            url={logo}
            name=""
            className="size-full object-contain"
          />
        ) : (
          <span className="font-heading text-lg font-medium uppercase">
            {firstGrapheme(name)}
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1 truncate normal-case">{name}</span>
      {aside ?? (
        <CheckIcon
          className={cn("size-5 shrink-0 text-primary", !chosen && "invisible")}
        />
      )}
    </>
  )
}
