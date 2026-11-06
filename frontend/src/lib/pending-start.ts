import {
  DRAFT_KEY,
  MADE_FROM_KEY,
  PENDING_START_KEY,
  REQUEST_IN_PROGRESS,
  START_RETRY_MS,
  START_WAIT_MS,
} from "@/config/start-test"
import { ApiError } from "@/lib/api"

/** An interview to make, kept in the tab from the home page's Continue until the generating
 * page has made it (app/generate/new), so a reload there carries on with the same start: `key`
 * makes the interview once (sent as its Idempotency-Key). */
export type PendingStart = {
  key: string
  text: string
  generateIn: string
  companyId: string
}

/** The start under way in this tab; null when there's none or storage is blocked. */
export function readPendingStart(): PendingStart | null {
  try {
    const value = JSON.parse(
      sessionStorage.getItem(PENDING_START_KEY) ?? "null"
    )

    return value && typeof value.key === "string" ? value : null
  } catch {
    return null
  }
}

/** Keeps the start; with storage blocked, the generating page has nothing to make. */
export function savePendingStart(start: PendingStart) {
  try {
    sessionStorage.setItem(PENDING_START_KEY, JSON.stringify(start))
  } catch {
    // Not kept.
  }
}

export function clearPendingStart() {
  try {
    sessionStorage.removeItem(PENDING_START_KEY)
  } catch {
    // Nothing was kept.
  }
}

/** The job description sent from the home page and the language to make it in. */
export type Draft = { text: string; generateIn: string }

/** The description kept in this tab as stored (the same string until it changes, as React's
 * external stores need); null when there's none or storage is blocked. */
export function draftJson(): string | null {
  try {
    return sessionStorage.getItem(DRAFT_KEY)
  } catch {
    return null
  }
}

/** A stored description read back; null when there's none or it's unreadable. */
export function parseDraft(json: string | null): Draft | null {
  try {
    const value = JSON.parse(json ?? "null")

    return value && typeof value.text === "string" ? value : null
  } catch {
    return null
  }
}

export function readDraft() {
  return parseDraft(draftJson())
}

export function saveDraft(draft: Draft) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // Not kept: the company page then sends the user back to the box.
  }
}

/** Once its interview is made, the description and the start are done with. */
export function saveMadeFrom(generationId: string, text: string) {
  try {
    sessionStorage.setItem(`${MADE_FROM_KEY}:${generationId}`, text)
  } catch {
    // Only the generating page's line goes without it.
  }
}

export function readMadeFrom(generationId: string): string | null {
  try {
    return sessionStorage.getItem(`${MADE_FROM_KEY}:${generationId}`)
  } catch {
    return null
  }
}

// Checked once a page load: going back to the box later keeps the draft.
let reloadChecked = false

/** A reloaded page starts its box empty; coming back from choosing the company keeps the text. */
export function forgetDraftOnReload() {
  if (reloadChecked) {
    return
  }

  reloadChecked = true
  const [load] = performance.getEntriesByType("navigation")

  if ((load as PerformanceNavigationTiming | undefined)?.type !== "reload") {
    return
  }

  try {
    sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // Nothing was kept.
  }
}

export function clearStart() {
  clearPendingStart()

  try {
    sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // Nothing was kept.
  }
}

/** Whether the service answered (a refusal or an error); a request cut off by a reload or a
 * lost connection never got an answer, so its start is kept and can be made again. */
export function answered(error: unknown) {
  return error instanceof ApiError
}

/** Whether the service said the same create is still running. */
export function stillRunning(error: unknown) {
  return error instanceof ApiError && error.code === REQUEST_IN_PROGRESS
}

/** `call`, asked again while the service says the same create still runs (the one before a
 * reload), for at most START_WAIT_MS; then its refusal. */
export async function whenDone<T>(call: () => Promise<T>): Promise<T> {
  const until = Date.now() + START_WAIT_MS

  for (;;) {
    try {
      return await call()
    } catch (error) {
      if (!stillRunning(error) || Date.now() > until) {
        throw error
      }
    }

    await new Promise((resolve) => setTimeout(resolve, START_RETRY_MS))
  }
}
