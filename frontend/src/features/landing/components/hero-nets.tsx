"use client"

import { useEffect, useState } from "react"

import { HeroNet, netSquare } from "@/features/landing/components/hero-net"
import { HERO_NET, HERO_NET_SPOTS } from "@/config/landing"
import { useElementSize } from "@/hooks/use-element-size"

/** Whether a net around (`x`, `y`) stays off `box`, up to where it's faded out. */
function clearOf(box: DOMRect, x: number, y: number) {
  const room = HERO_NET.reach * HERO_NET.cell * HERO_NET.visible

  return (
    x + room < box.left ||
    x - room > box.right ||
    y + room < box.top ||
    y - room > box.bottom
  )
}

/** The hero's background, across the window: bare squares fading out of its corners, and a net of
 * people in its empty place, when it stays off the title, the box and the facts
 * (`data-hero-content`), measured at the hero's size. Behind everything, from laptops up.
 * Decoration only. */
export function HeroNets() {
  const { ref, size } = useElementSize<HTMLDivElement>()
  const [points, setPoints] = useState<number[][]>([])

  useEffect(() => {
    const layer = ref.current?.getBoundingClientRect()

    if (!size || !layer) {
      return
    }

    const content = [...document.querySelectorAll("[data-hero-content]")].map(
      (element) => element.getBoundingClientRect()
    )
    const spots = HERO_NET_SPOTS.map(([x, y]) => [
      netSquare(x * size.width),
      netSquare(y * size.height),
    ])

    setPoints(
      spots.filter(([x, y]) =>
        content.every((box) => clearOf(box, x + layer.left, y + layer.top))
      )
    )
  }, [ref, size])

  return (
    <div
      ref={ref}
      aria-hidden
      data-own-net
      className="pointer-events-none absolute start-[calc(50%-50cqw)] top-0 -z-10 h-full w-[100cqw] overflow-hidden"
    >
      <div className="hero-corners" />
      <div className="hero-corners hero-corner-bottom" />
      {points.length > 0 && <HeroNet points={points} />}
    </div>
  )
}
