import type { LucideIcon } from "lucide-react"
import type { CSSProperties } from "react"

import { IconCard } from "@/components/common/icon-card"
import { FlowReveal } from "@/features/hiring-flow/components/flow-reveal"

/** Where the line fans out, coming in when the cards themselves are seen (a tall stage is seen
 * long before them): a bar across, drawn out from the middle, and
 * under it the ways the stage can go as the landing's grey cards (an icon, a title and what it
 * does), solid over the line (the dark theme's grey is see-through), text at the top, coming in
 * one after another; all on one row from laptops up, each hanging from the bar, two to a row on
 * tablets, one under another beside the line on phones. */
export function FlowBranches({
  label,
  branches,
}: {
  label: string
  branches: { key: string; icon: LucideIcon; title: string; text: string }[]
}) {
  return (
    <FlowReveal
      group="ways"
      className="relative mt-12 ps-[4.5rem] md:ps-0 lg:pt-20"
    >
      <span
        aria-hidden
        // From the first card's middle to the last one's: half a card in from each side.
        style={{ "--ways": branches.length } as CSSProperties}
        className="absolute inset-x-[calc((100%_-_(var(--ways)_-_1)*0.75rem)/var(--ways)/2)] top-0 hidden h-0.5 origin-center rounded-full bg-primary-gradient transition-transform delay-500 duration-700 group-data-ready/ways:not-group-data-shown/ways:scale-x-0 lg:block"
      />
      <ul
        aria-label={label}
        // Over the line, gaps included: the line stops at the bar and goes on under the cards.
        className="relative z-10 grid gap-3 bg-background sm:grid-cols-2 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none"
      >
        {branches.map((branch, index) => (
          <IconCard
            key={branch.key}
            icon={branch.icon}
            title={branch.title}
            style={{ transitionDelay: `${700 + index * 100}ms` }}
            // On one row the icon sits in a circle on the card's top edge, where the line from
            // the bar meets it, and the text is centred under it.
            className="relative z-10 justify-start bg-background bg-[linear-gradient(var(--surface),var(--surface))] transition-[opacity,translate] duration-500 group-data-ready/ways:not-group-data-shown/ways:translate-y-3 group-data-ready/ways:not-group-data-shown/ways:opacity-0 max-sm:rounded-xl lg:items-center lg:pe-5 lg:pt-11 lg:text-center lg:before:absolute lg:before:start-1/2 lg:before:-top-20 lg:before:h-20 lg:before:w-0.5 lg:before:origin-top lg:before:-translate-x-1/2 lg:before:bg-primary lg:before:transition-transform lg:before:delay-[inherit] lg:before:duration-500 group-data-ready/ways:not-group-data-shown/ways:lg:before:scale-y-0 rtl:lg:before:translate-x-1/2 lg:[&>svg]:start-1/2 lg:[&>svg]:end-auto lg:[&>svg]:top-0 lg:[&>svg]:size-16 lg:[&>svg]:-translate-x-1/2 lg:[&>svg]:-translate-y-1/2 lg:[&>svg]:rounded-full lg:[&>svg]:border lg:[&>svg]:bg-background lg:[&>svg]:p-4 lg:[&>svg]:text-primary rtl:lg:[&>svg]:translate-x-1/2"
          >
            {branch.text}
          </IconCard>
        ))}
      </ul>
    </FlowReveal>
  )
}
