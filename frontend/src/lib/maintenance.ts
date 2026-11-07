import {
  MAINTENANCE_CACHE_MS,
  MAINTENANCE_TIMEOUT_MS,
} from "@/config/maintenance"

export type MaintenanceState = "off" | "open" | "closed"

type Status = { on: boolean; superadmin: boolean }

const OFF: Status = { on: false, superadmin: false }
let cached = { status: OFF, until: 0 }
// The one call under way, so a burst of requests shares it.
let loading: Promise<void> | null = null

async function fetchStatus(token?: string): Promise<Status> {
  try {
    const response = await fetch(
      `${process.env.API_URL}/api/companies/maintenance`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
        signal: AbortSignal.timeout(MAINTENANCE_TIMEOUT_MS),
      }
    )

    return response.ok ? await response.json() : OFF
  } catch {
    return OFF
  }
}

function refresh() {
  loading ??= fetchStatus()
    .then((status) => {
      cached = { status, until: Date.now() + MAINTENANCE_CACHE_MS }
    })
    .finally(() => {
      loading = null
    })

  return loading
}

/** Maintenance mode for this visitor, as the companies service says: closed to everyone but
 * superadmins while it's on. Only a fresh instance's first requests wait for the answer; after
 * that an old answer is used while a new one is fetched. */
export async function maintenanceState(
  token?: string
): Promise<MaintenanceState> {
  if (cached.until === 0) {
    await refresh()
  } else if (Date.now() > cached.until) {
    void refresh()
  }

  if (!cached.status.on) {
    return "off"
  }

  const mine = token ? await fetchStatus(token) : cached.status

  return mine.superadmin ? "open" : "closed"
}
