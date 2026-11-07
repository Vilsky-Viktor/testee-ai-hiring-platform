import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { MAINTENANCE_CACHE_MS } from "@/config/maintenance"

const answer = (on: boolean) =>
  new Response(JSON.stringify({ on, superadmin: false }))

/** A fresh copy of the module, whose answer is cached per instance. */
async function freshState() {
  vi.resetModules()

  return (await import("@/lib/maintenance")).maintenanceState
}

describe("maintenanceState", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubEnv("API_URL", "http://gateway")
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it("makes one call for a burst of requests on a fresh instance", async () => {
    const fetcher = vi.fn().mockImplementation(async () => answer(true))
    vi.stubGlobal("fetch", fetcher)
    const maintenanceState = await freshState()

    const states = await Promise.all([
      maintenanceState(),
      maintenanceState(),
      maintenanceState(),
    ])

    expect(states).toEqual(["closed", "closed", "closed"])
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it("answers from the old state while one new call is under way", async () => {
    let finish: (response: Response) => void = () => undefined
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(answer(false))
      .mockImplementationOnce(
        () => new Promise((resolve) => (finish = resolve))
      )
    vi.stubGlobal("fetch", fetcher)
    const maintenanceState = await freshState()
    await maintenanceState()
    vi.advanceTimersByTime(MAINTENANCE_CACHE_MS + 1)

    expect(await maintenanceState()).toBe("off")
    expect(await maintenanceState()).toBe("off")
    expect(fetcher).toHaveBeenCalledTimes(2)

    finish(answer(true))
    await vi.advanceTimersByTimeAsync(0)

    expect(await maintenanceState()).toBe("closed")
  })
})
