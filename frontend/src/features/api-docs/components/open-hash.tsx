"use client"

import { useEffect } from "react"

/** Opens the collapsed object an address points to (a type's link to it), as not every browser
 * does. Renders nothing. */
export function OpenHash() {
  useEffect(() => {
    function open() {
      const target = document.getElementById(location.hash.slice(1))

      if (target instanceof HTMLDetailsElement) {
        target.open = true
        target.scrollIntoView()
      }
    }

    open()
    window.addEventListener("hashchange", open)

    return () => window.removeEventListener("hashchange", open)
  }, [])

  return null
}
