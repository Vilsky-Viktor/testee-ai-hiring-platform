"use client"

import { type RefObject, useEffect, useState } from "react"

// How far the camera zooms in on the pointer's target (less on phones), and how much of the way it
// turns towards it: all of it, as far as the box's edges allow.
const ZOOM = 1.3
const PHONE_ZOOM = 1.12
const PHONE_WIDTH = 640
const FOLLOW = 1
// Measured again this long after a step starts: a window opening moves its target as it animates.
const SETTLE_MS = 450
const REST = { scale: 1, x: 0, y: 0 }

/** A landing demo's camera, like a product video's: for each step (`step`) the box `camera`
 * zooms towards `target` (the pointer's; its part marked `data-camera-focus`, if any) and eases back out when there's none. Its translation is
 * kept within what the zoom adds, so the box's edges never show. Measured in the box's own size,
 * so a box already scaled measures the same. */
export function useDemoCamera(
  camera: RefObject<HTMLElement | null>,
  target: RefObject<HTMLElement | null> | null,
  step: number
) {
  const [view, setView] = useState(REST)

  useEffect(() => {
    const box = camera.current

    if (!box) {
      return
    }

    function aim() {
      // A target may name the part to look at (a row's title, the words being typed).
      const element = target?.current
      const goal = (
        element?.querySelector<HTMLElement>("[data-camera-focus]") ?? element
      )?.getBoundingClientRect()
      const rect = box!.getBoundingClientRect()

      if (!goal || !rect.width) {
        setView(REST)

        return
      }

      const ratio = box!.offsetWidth / rect.width
      const width = box!.offsetWidth
      const height = box!.offsetHeight
      const scale = width < PHONE_WIDTH ? PHONE_ZOOM : ZOOM
      const x = (goal.left + goal.width / 2 - rect.left) * ratio - width / 2
      const y = (goal.top + goal.height / 2 - rect.top) * ratio - height / 2
      const within = (value: number, size: number) =>
        Math.max(
          (-(scale - 1) * size) / 2,
          Math.min(((scale - 1) * size) / 2, value)
        )

      setView({
        scale,
        x: within(-scale * x * FOLLOW, width),
        y: within(-scale * y * FOLLOW, height),
      })
    }

    const frame = requestAnimationFrame(aim)
    const settled = setTimeout(aim, SETTLE_MS)

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(settled)
    }
  }, [camera, target, step])

  return view
}
