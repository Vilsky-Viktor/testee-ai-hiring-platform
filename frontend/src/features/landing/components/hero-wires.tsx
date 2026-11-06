"use client"

import { HeroNet, netSquare } from "@/features/landing/components/hero-net"
import { HeroSource } from "@/features/landing/components/hero-source"
import { Wire } from "@/features/landing/components/wire"
import {
  HERO_WIRES,
  OUT_SIZE,
  OUT_SPEED,
  OUT_THICKNESS,
  WIRE_UNDER,
} from "@/config/landing"
import { useElementSize } from "@/hooks/use-element-size"

/** The wires coming from floating circles (HeroSource) around the job description box into its top
 * edge, each with a candidate's icon running along it, on a net of people (HeroNet); fills the space
 * above the box. Drawn in pixels once its size is known, so a spark is one short piece at any size;
 * from laptops up, where the box has a column of its own. Decoration only. */
export function HeroWiresIn() {
  const { ref, size } = useElementSize<SVGSVGElement>()
  const x = (percent: number) => (percent * (size?.width ?? 0)) / 100
  const y = (percent: number) => (percent * (size?.height ?? 0)) / 100
  const starts = HERO_WIRES.map((wire) => [
    netSquare(x(wire.from)),
    netSquare(y(wire.fromY)),
  ])

  return (
    <>
      {size && <HeroNet points={starts} />}
      <svg
        ref={ref}
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden size-full overflow-visible text-ring lg:block"
      >
        {size &&
          HERO_WIRES.map((wire, index) => {
            const [startX, startY] = starts[index]
            const [[x1, y1], [x2, y2]] = wire.bends
            const path = `M ${startX} ${startY} C ${x(x1)} ${y(y1)}, ${x(x2)} ${y(y2)}, ${x(wire.to)} ${size.height + WIRE_UNDER}`

            return (
              <Wire
                key={wire.from}
                d={path}
                delay={wire.delay}
                traveller="candidate"
              />
            )
          })}
      </svg>
      {size && (
        <div aria-hidden className="pointer-events-none max-lg:hidden">
          {HERO_WIRES.map((wire, index) => (
            <HeroSource
              key={wire.from}
              wire={wire}
              x={starts[index][0]}
              y={starts[index][1]}
            />
          ))}
        </div>
      )}
    </>
  )
}

/** The one wire going on from the box's bottom edge down to the next section, straight, its
 * candidates bigger and slower; fills the space under the box. */
export function HeroWireOut() {
  const { ref, size } = useElementSize<SVGSVGElement>()

  return (
    <svg
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden size-full overflow-visible text-ring lg:block"
    >
      {size && (
        <Wire
          d={`M ${size.width / 2} 0 L ${size.width / 2} ${size.height}`}
          traveller="candidate"
          size={OUT_SIZE}
          thickness={OUT_THICKNESS}
          speed={OUT_SPEED}
        />
      )}
    </svg>
  )
}
