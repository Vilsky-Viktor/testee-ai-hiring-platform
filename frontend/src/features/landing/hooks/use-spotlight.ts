import { type RefObject, useEffect, useRef } from "react"

/** Lights `field` (a landing promo's field about to be typed in) with `data-spotlight`
 * (promo.css) until it changes. Kept on the same field from step to step (`step`; each typed
 * letter is one), so its pulse never restarts; moved only when the field changes. */
export function useSpotlight(
  field: RefObject<HTMLElement | null> | null | undefined,
  step: number
) {
  const lit = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = field?.current ?? null

    if (element !== lit.current) {
      lit.current?.removeAttribute("data-spotlight")
      element?.setAttribute("data-spotlight", "")
      lit.current = element
    }
  }, [field, step])

  useEffect(() => () => lit.current?.removeAttribute("data-spotlight"), [])
}
