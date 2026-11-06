import { type RefObject, useEffect } from "react"

// How long the bump plays (promo-tick, promo.css), in milliseconds.
const BUMP_MS = 400

/** Bumps `target` (what a landing promo's pointer clicks) with `data-clicked` (promo.css) as the
 * click lands, at `step` while `clicking`: a small bump, as a picked answer gives. The attribute
 * goes once the bump is over, so a later click on the same element bumps it again. */
export function useClickBump(
  target: RefObject<HTMLElement | null> | null | undefined,
  clicking: boolean,
  step: number
) {
  useEffect(() => {
    const element = clicking ? (target?.current ?? null) : null

    if (!element) {
      return
    }

    element.setAttribute("data-clicked", "")
    const timer = setTimeout(
      () => element.removeAttribute("data-clicked"),
      BUMP_MS
    )

    return () => {
      clearTimeout(timer)
      element.removeAttribute("data-clicked")
    }
  }, [target, clicking, step])
}
