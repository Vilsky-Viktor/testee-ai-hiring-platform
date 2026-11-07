"use client"

import { useState, useSyncExternalStore } from "react"

import {
  parseStatsChoice,
  periodOnlyChoice,
  savedStatsChoice,
  writeStatsChoice,
  type StatsChoice,
} from "@/lib/stats-period"

// Storage isn't watched for changes from other tabs: the choice is read once per visit.
const unwatched = () => () => {}

/** The admin zone's period (the stats and AI costs tabs share it): the choice the browser kept
 * from last time (this month at first), null until the browser can read it; `query` is the API's
 * `?period=` for it ("" for all time). `periodOnly`: a tab without "all time". */
export function useStatsChoice(periodOnly = false) {
  // The saved choice exists only in the browser: the server renders without it (null).
  const saved = useSyncExternalStore(unwatched, savedStatsChoice, () => null)
  const [picked, setPicked] = useState<StatsChoice | null>(null)
  const kept =
    picked ?? (saved === null ? null : parseStatsChoice(saved, new Date()))
  const choice = kept && periodOnly ? periodOnlyChoice(kept, new Date()) : kept
  const query = !choice
    ? null
    : choice.allTime
      ? ""
      : `?period=${choice.period}`

  function change(next: StatsChoice) {
    setPicked(next)
    writeStatsChoice(next)
  }

  return { choice, query, change }
}
