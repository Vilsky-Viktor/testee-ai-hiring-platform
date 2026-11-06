import { NetSquares } from "@/features/landing/components/hero-net"

/** Squares with a person in each, fading out of the page's top right corner as the home page's top
 * left one does; under the page's content, in an element as wide as the window. From laptops up.
 * Decoration only. */
export function CornerNet() {
  return (
    <NetSquares
      data-own-net
      className="hero-corner-right pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 w-full text-muted-foreground max-lg:hidden"
    />
  )
}
