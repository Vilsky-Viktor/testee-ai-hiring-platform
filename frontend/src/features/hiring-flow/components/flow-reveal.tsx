"use client"

import { cn } from "cn"
import { type ReactNode, useEffect, useRef, useState } from "react"

// How much of a stage must be on screen before it comes in.
const SEEN = 0.2

// The groups children animate on: a stage (`group-data-shown/flow`), or its ways' cards
// (`group-data-shown/ways`), which come in when they're seen themselves.
const GROUPS = { flow: "group/flow", ways: "group/ways" } as const

/** A stage, or its ways' cards (`group`), that comes in as it's scrolled to: `data-shown` is set
 * once it's seen, and its children animate on `group-data-shown/<group>`. It's hidden only once
 * scripts run (`data-ready`), so without them, and with reduced motion, everything shows at
 * once. */
export function FlowReveal({
  group = "flow",
  className,
  children,
}: {
  group?: keyof typeof GROUPS
  className?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const element = ref.current

    if (!element) {
      return
    }

    setReady(true)
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: SEEN }
    )
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-ready={ready || undefined}
      data-shown={shown || undefined}
      className={cn(GROUPS[group], className)}
    >
      {children}
    </div>
  )
}
