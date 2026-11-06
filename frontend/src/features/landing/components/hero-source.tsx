import { HERO_WIRES } from "@/config/landing"

type Wire = (typeof HERO_WIRES)[number]

/** Where a hero wire starts, centred on (`x`, `y`): a floating hollow circle in the primary colour
 * with a ring pulsing out of it, each on its own beat (still with reduced motion). The wire runs out
 * from under the circle, which hides its end. Decoration only. */
export function HeroSource({
  wire,
  x,
  y,
}: {
  wire: Wire
  x: number
  y: number
}) {
  return (
    <span
      data-testid="hero-source"
      style={
        {
          left: x,
          top: y,
          "--float": `${wire.sway}s`,
          "--phase": `-${wire.delay}s`,
        } as React.CSSProperties
      }
      className="absolute -translate-x-1/2 -translate-y-1/2 motion-safe:animate-[source-float_var(--float)_ease-in-out_var(--phase)_infinite]"
    >
      <span
        style={{ animationDelay: `${wire.delay}s` }}
        className="absolute inset-0 animate-ping rounded-full border-2 border-primary/60 [animation-duration:3s] motion-reduce:hidden"
      />
      <span className="relative block size-9 rounded-full border-2 border-primary bg-background/70" />
    </span>
  )
}
