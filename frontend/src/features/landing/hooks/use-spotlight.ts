import { type RefObject, useEffect, useRef } from "react"

// How long a field's light takes to fade once it's no longer lit (promo-spotlight-out).
const FADE_MS = 600

/** Lights `field` (a landing promo's field about to be typed in) with `data-spotlight`
 * (promo.css) until it changes. Kept on the same field from step to step (`step`; each typed
 * letter is one), so its pulse never restarts; moved only when the field changes. The field left
 * fades from the colour its pulse had reached back to its own (`data-spotlight-out`). */
export function useSpotlight(
  field: RefObject<HTMLElement | null> | null | undefined,
  step: number
) {
  const lit = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = field?.current ?? null

    if (element !== lit.current) {
      if (lit.current) {
        fadeOut(lit.current)
      }

      element?.setAttribute("data-spotlight", "")
      lit.current = element
    }
  }, [field, step])

  useEffect(() => () => lit.current?.removeAttribute("data-spotlight"), [])
}

/** Ends `element`'s light smoothly: from the colour its box has now, back to its own. */
function fadeOut(element: HTMLElement) {
  const box = element.querySelector<HTMLElement>("input, textarea") ?? element
  element.style.setProperty(
    "--spotlight-from",
    getComputedStyle(box).backgroundColor
  )
  element.removeAttribute("data-spotlight")
  element.setAttribute("data-spotlight-out", "")
  setTimeout(() => element.removeAttribute("data-spotlight-out"), FADE_MS)
}
