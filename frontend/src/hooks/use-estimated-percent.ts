import { useEffect, useState } from "react"

import {
  ESTIMATE_MAX_PERCENT,
  ESTIMATE_PACE_MS,
  ESTIMATE_TICK_MS,
} from "@/config/generation"

const STEP = 1 - Math.exp(-ESTIMATE_TICK_MS / ESTIMATE_PACE_MS)

/** A percent to show for work that reports late: `real`, or an estimate rising slowly towards
 * ESTIMATE_MAX_PERCENT while that's higher. It never goes back. */
export function useEstimatedPercent(real: number) {
  const [estimate, setEstimate] = useState(real)

  useEffect(() => {
    const timer = setInterval(() => {
      setEstimate((current) => {
        const from = Math.max(current, real)

        return from < ESTIMATE_MAX_PERCENT
          ? from + (ESTIMATE_MAX_PERCENT - from) * STEP
          : from
      })
    }, ESTIMATE_TICK_MS)

    return () => clearInterval(timer)
  }, [real])

  return Math.round(Math.max(estimate, real))
}
