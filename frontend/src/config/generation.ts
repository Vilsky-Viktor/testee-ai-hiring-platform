import type { GenerationStatus } from "@/types/generation"

// A generation is polled every POLL_MIN_MS while it moves; each poll that brings no change waits
// POLL_BACKOFF times longer, up to POLL_MAX_MS. A hidden tab doesn't poll.
export const POLL_MIN_MS = 2000
export const POLL_MAX_MS = 10000
export const POLL_BACKOFF = 1.5
// While no batch of questions has reported, the percent shown is an estimate: it rises every
// ESTIMATE_TICK_MS, a share of what's left to ESTIMATE_MAX_PERCENT, slowing as it nears it, with
// this time constant. Past that only the real value moves it; it takes over once it's higher.
export const ESTIMATE_TICK_MS = 500
export const ESTIMATE_MAX_PERCENT = 50
export const ESTIMATE_PACE_MS = 25_000
export const ACTIVE_STATUSES: GenerationStatus[] = ["queued", "running"]
