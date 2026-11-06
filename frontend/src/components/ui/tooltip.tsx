"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { cn } from "cn"

function TooltipProvider({
  delay = 200,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider delay={delay} {...props} />
}

function Tooltip(props: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger(props: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 8,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, "side" | "sideOffset">) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        className="z-50"
      >
        <TooltipPrimitive.Popup
          className={cn(
            // In the text's colour, inverted, so it stands out on the page, a card or a grey row
            // in both themes. A quick fade and a slight rise in and out.
            "max-w-xs rounded-lg bg-(--tooltip) px-3 py-1.5 text-sm text-balance text-foreground transition-[opacity,scale] duration-150 [--tooltip:color-mix(in_oklab,black_24%,var(--background))] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 motion-reduce:transition-none dark:[--tooltip:color-mix(in_oklab,white_24%,var(--background))]",
            className
          )}
          {...props}
        >
          {children}
          {/* Points at what it names. */}
          <TooltipPrimitive.Arrow className="size-2 rotate-45 bg-(--tooltip) data-[side=bottom]:-top-1 data-[side=left]:-right-1 data-[side=right]:-left-1 data-[side=top]:-bottom-1" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
