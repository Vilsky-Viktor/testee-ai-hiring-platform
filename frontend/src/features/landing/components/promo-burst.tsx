import { cn } from "cn"
import { StarIcon } from "lucide-react"

// Sparks: 28 of them around the middle, each flying to (x, y) in percent of the preview's width
// and height, near and far, so they reach every part of it.
const SPARKS = Array.from({ length: 28 }, (_, index) => {
  const angle = (index / 28) * 2 * Math.PI
  const reach = index % 2 === 0 ? 40 : 26

  // Rounded, so the server and the browser write the same numbers (hydration).
  return [Math.cos(angle) * reach, Math.sin(angle) * reach].map(
    (value) => Math.round(value * 10) / 10
  )
})

/** A big moment in the create promo, over the whole preview (its box `relative`): a glow in the
 * primary colour swelling from the middle and fading, and dots and stars flying out across it,
 * once;
 * both gone before they reach the preview's edges. Drawn only with motion allowed. */
export function PromoBurst({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "@container pointer-events-none absolute inset-0 z-30 overflow-hidden motion-reduce:hidden",
        className
      )}
    >
      {/* Sized to the preview's nearer sides, its colour gone a fifth of the way short of them. */}
      <span className="absolute inset-0 animate-[promo-glow_1.4s_ease-out_forwards] bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--primary)_25%,transparent),color-mix(in_oklab,var(--primary)_10%,transparent)_45%,transparent_80%)] opacity-0" />
      {/* Dots and, every third, a star. */}
      {SPARKS.map(([x, y], index) => {
        const style = {
          "--dx": `${x}cqw`,
          "--dy": `${y}cqh`,
          animationDelay: `${(index % 4) * 60}ms`,
        } as React.CSSProperties
        const flight =
          "absolute start-1/2 top-1/2 animate-[promo-spark_1.3s_ease-out_forwards] opacity-0"

        return index % 3 === 0 ? (
          <StarIcon
            key={index}
            style={style}
            className={cn(flight, "size-6 text-primary")}
          />
        ) : (
          <span
            key={index}
            style={style}
            className={cn(
              flight,
              "rounded-full bg-primary",
              index % 3 === 1 ? "size-2.5" : "size-1.5"
            )}
          />
        )
      })}
    </span>
  )
}
