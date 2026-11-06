import { type RefObject, useEffect } from "react"

/** ⌘/Ctrl + K moves to the header's search field, while `on`. */
export function useSearchShortcut(
  on: boolean,
  field: RefObject<HTMLInputElement | null>
) {
  useEffect(() => {
    if (!on) {
      return
    }

    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        field.current?.focus()
      }
    }

    document.addEventListener("keydown", onKey)

    return () => document.removeEventListener("keydown", onKey)
  }, [on, field])
}
