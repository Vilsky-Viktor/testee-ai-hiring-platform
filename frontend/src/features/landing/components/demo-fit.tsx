"use client"

import { useEffect, useRef, useState } from "react"

import { DEMO_ROOM_PX } from "@/config/landing"

/** A demo's frame, drawn smaller where the window is too short to show it whole, so its buttons
 * and steps stay on screen as it plays; the page closes up the room saved. */
export function DemoFit({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState({ scale: 1, saved: 0 })

  useEffect(() => {
    function measure() {
      const height = ref.current?.offsetHeight ?? 0
      const scale = height
        ? Math.min((window.innerHeight - DEMO_ROOM_PX) / height, 1)
        : 1
      setFit({ scale, saved: height * (1 - scale) })
    }

    measure()
    window.addEventListener("resize", measure)

    return () => window.removeEventListener("resize", measure)
  }, [])

  return (
    <div
      ref={ref}
      className="origin-top"
      style={
        fit.scale < 1
          ? { scale: fit.scale, marginBottom: -fit.saved }
          : undefined
      }
    >
      {children}
    </div>
  )
}
