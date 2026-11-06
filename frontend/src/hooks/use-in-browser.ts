"use client"

import { useSyncExternalStore } from "react"

function subscribe() {
  return () => {}
}

/** Whether this render is in the browser: false on the server and in the browser's first render,
 * which has to match it, and true from then on. */
export function useInBrowser() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
