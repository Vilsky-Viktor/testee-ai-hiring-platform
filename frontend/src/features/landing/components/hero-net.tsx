import { UserRoundIcon } from "lucide-react"
import { type ComponentProps, useId } from "react"

import { HERO_NET } from "@/config/landing"

/** A grid of squares with a person in each, filling the svg `props` give its size and place. */
export function NetSquares(props: ComponentProps<"svg">) {
  const pattern = useId().replace(/\W/g, "")
  const { cell, icon } = HERO_NET
  const inset = (cell - icon) / 2

  return (
    <svg {...props} aria-hidden>
      <defs>
        <pattern
          id={pattern}
          width={cell}
          height={cell}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${cell} 0 H 0 V ${cell}`}
            fill="none"
            className="stroke-border"
          />
          <UserRoundIcon
            x={inset}
            y={inset}
            width={icon}
            height={icon}
            strokeWidth={1.5}
            opacity={0.45}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${pattern})`} />
    </svg>
  )
}

/** The net under the hero's wires: one grid, showing only around the `points` and fading out a few
 * squares away in every direction, so nets that meet line up. Points in a square's middle
 * (`netSquare`) sit right in it. Decoration only. */
export function HeroNet({ points }: { points: number[][] }) {
  const { cell, reach } = HERO_NET
  const past = reach * cell
  const xs = points.map(([x]) => x)
  const ys = points.map(([, y]) => y)
  // On the grid, so it's the same grid wherever the net starts.
  const left = Math.floor((Math.min(...xs) - past) / cell) * cell
  const top = Math.floor((Math.min(...ys) - past) / cell) * cell
  const mask = points
    .map(
      ([x, y]) =>
        `radial-gradient(circle ${past}px at ${x - left}px ${y - top}px, black 30%, transparent)`
    )
    .join(",")

  return (
    <NetSquares
      width={Math.max(...xs) + past - left}
      height={Math.max(...ys) + past - top}
      style={{ left, top, maskImage: mask }}
      className="pointer-events-none absolute text-muted-foreground max-lg:hidden"
    />
  )
}

/** `at`, moved to the middle of its square of the net. */
export function netSquare(at: number) {
  const { cell } = HERO_NET

  return (Math.floor(at / cell) + 0.5) * cell
}
