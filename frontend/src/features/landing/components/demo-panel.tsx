import { cn } from "cn"

// A button in a demo as the pointer clicks it: the real button's pressed look
// (components/ui/button.tsx), shrunk and dimmed a little.
// `demo-pressed` marks it for the create promo's glow (promo.css); elsewhere it does nothing.
export const DEMO_PRESSED =
  "demo-pressed translate-y-px scale-[0.97] opacity-80"

// Something new in a promo arriving: up from a little smaller and out of focus (promo-pop,
// promo.css); only with motion allowed.
export const PROMO_POP =
  "motion-safe:animate-[promo-pop_0.5s_cubic-bezier(0.2,0.9,0.3,1.2)_both]"

// A group of panels, laid out in a column.
export const DEMO_GROUP = "flex flex-col gap-3"

// A small grey card on a wired stage (sections 2 and 5): an icon and a short label, stacked in a
// grid cell on phones and tablets, side by side from laptops up.
export const SOURCE_CARD =
  "relative z-10 flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl bg-surface px-1.5 py-4 text-center text-sm leading-tight font-medium break-words lowercase lg:flex-row lg:gap-2.5 lg:rounded-xl lg:px-5 lg:py-3.5 lg:text-base lg:whitespace-nowrap"

/** A small landing picture with its short label above, if any: a plain card that fills its
 * grid cell, so panels side by side are the same height. Screen readers read the label, not the
 * picture. */
export function DemoPanel({
  ref,
  label,
  className,
  children,
}: {
  ref?: React.Ref<HTMLDivElement>
  label?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      ref={ref}
      data-testid="demo-panel"
      className="flex min-w-0 flex-col gap-3"
    >
      {label && <DemoLabel>{label}</DemoLabel>}
      {/* A picture: hidden from screen readers and out of the keyboard's way (its code box would
          otherwise take focus). */}
      <div
        aria-hidden
        inert
        className={cn(
          "relative flex flex-1 flex-col rounded-xl border bg-background p-3 text-start text-sm max-sm:-mx-6 max-sm:rounded-none max-sm:border-x-0",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

/** A landing picture's or group's short label, centred. */
export function DemoLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-center font-heading text-lg font-medium lowercase">
      {children}
    </p>
  )
}
