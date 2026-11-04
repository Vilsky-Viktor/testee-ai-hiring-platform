import { cn } from "cn"

// Sparks: 28 of them around the middle, each flying to (x, y) in percent of the preview's width
// and height, near and far, so they reach every part of it.
const SPARKS = Array.from({ length: 28 }, (_, index) => {
  const angle = (index / 28) * 2 * Math.PI
  const reach = index % 2 === 0 ? 46 : 30

  // Rounded, so the server and the browser write the same numbers (hydration).
  return [Math.cos(angle) * reach, Math.sin(angle) * reach].map(
    (value) => Math.round(value * 10) / 10
  )
})

/** A big moment in the create promo, over the whole preview (its box `relative`): a glow in the
 * primary colour swelling from the middle to the edges and fading, and sparks flying out across
 * it, once. Drawn only with motion allowed. */
export function PromoBurst({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "@container pointer-events-none absolute inset-0 z-30 overflow-hidden motion-reduce:hidden",
        className
      )}
    >
      <span className="absolute inset-0 animate-[promo-glow_1.4s_ease-out_forwards] bg-radial from-primary/25 via-primary/10 to-transparent to-75% opacity-0" />
      {SPARKS.map(([x, y], index) => (
        <span
          key={index}
          style={
            {
              "--dx": `${x}cqw`,
              "--dy": `${y}cqh`,
              animationDelay: `${(index % 4) * 60}ms`,
            } as React.CSSProperties
          }
          className={cn(
            "absolute start-1/2 top-1/2 animate-[promo-spark_1.3s_ease-out_forwards] rounded-full bg-primary opacity-0",
            index % 3 === 0 ? "size-2.5" : "size-1.5"
          )}
        />
      ))}
    </span>
  )
}
