"use client"

import { type ReactNode, useEffect, useRef } from "react"

/** The flow's line: grey from top to bottom, drawn in the primary colour down to the middle of
 * the screen as the page scrolls (`--flow`, 0 to 1, set without re-rendering). In the middle
 * from tablets up, along the start edge on phones. Without scripts it's drawn whole; reduced
 * motion draws it at once, as the reset stops the transition. */
export function FlowLine({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current

    if (!element) {
      return
    }

    let frame = 0
    const draw = () => {
      frame = 0
      const box = element.getBoundingClientRect()
      const drawn = (window.innerHeight / 2 - box.top) / box.height
      element.style.setProperty(
        "--flow",
        String(Math.min(1, Math.max(0, drawn)))
      )
    }
    const onScroll = () => {
      frame ||= window.requestAnimationFrame(draw)
    }

    draw()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [])

  return (
    <div ref={ref} className="relative">
      <div
        aria-hidden
        className="absolute inset-y-0 start-6 w-0.5 -translate-x-1/2 rounded-full bg-border md:start-1/2 rtl:translate-x-1/2"
      >
        <div className="h-full w-full origin-top scale-y-(--flow,1) rounded-full bg-primary-gradient transition-transform duration-150 ease-out" />
      </div>
      {children}
    </div>
  )
}
