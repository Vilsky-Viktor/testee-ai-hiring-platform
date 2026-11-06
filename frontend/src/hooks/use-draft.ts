import { useSyncExternalStore } from "react"

import { draftJson, parseDraft, readMadeFrom } from "@/lib/pending-start"

// The tab's storage tells no one of its changes: read on each render.
function unwatched() {
  return () => {}
}

/** The job description kept in the tab while its company is chosen, if any. */
export function useDraft() {
  return parseDraft(useSyncExternalStore(unwatched, draftJson, () => null))
}

/** The job description the generation `id` is being made from, if this tab started it. */
export function useMadeFrom(id: string | undefined) {
  return useSyncExternalStore(
    unwatched,
    () => (id ? readMadeFrom(id) : null),
    () => null
  )
}
