import { POLL_BACKOFF, POLL_MAX_MS, POLL_MIN_MS } from "@/config/generation"
import type { Generation } from "@/types/generation"

/** The wait before the next poll: the shortest after a change, longer after each poll that
 * brought none, up to the longest. */
export function nextPollDelay(delay: number, changed: boolean) {
  return changed ? POLL_MIN_MS : Math.min(delay * POLL_BACKOFF, POLL_MAX_MS)
}

/** The questions are written and the last steps, checking and saving them, are running, with no
 * progress to report: the generation is about to be done. */
export function isFinishing(progress: Generation["progress"] | undefined) {
  return Boolean(
    progress && progress.total > 0 && progress.done >= progress.total
  )
}
