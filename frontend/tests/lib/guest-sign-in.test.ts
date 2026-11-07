import { afterEach, beforeEach, expect, it, vi } from "vitest"

const auth = { name: "auth" }
const setPersistence = vi.fn(async () => {})
const signInWithCustomToken = vi.fn(async () => {})
const browserSessionPersistence = { type: "SESSION" }

vi.mock("firebase/auth", () => ({
  setPersistence,
  signInWithCustomToken,
  browserSessionPersistence,
}))
vi.mock("@/lib/firebase", () => ({ firebaseAuth: async () => auth }))

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// A guest link opened on a shared computer leaves no one signed in once the tab is closed.
it("keeps a guest's sign-in to the tab, set before signing in", async () => {
  const page: { top?: unknown; self?: unknown } = {}
  page.top = page
  page.self = page
  vi.stubGlobal("window", page)
  const { signInAsGuest } = await import("@/lib/auth")

  await signInAsGuest("token")

  expect(setPersistence).toHaveBeenCalledWith(auth, browserSessionPersistence)
  expect(signInWithCustomToken).toHaveBeenCalledWith(auth, "token")
  expect(setPersistence.mock.invocationCallOrder[0]).toBeLessThan(
    signInWithCustomToken.mock.invocationCallOrder[0] as number
  )
})

it("leaves a framed guest's sign-in in memory", async () => {
  vi.stubGlobal("window", { top: {}, self: {} })
  const { signInAsGuest } = await import("@/lib/auth")

  await signInAsGuest("token")

  expect(setPersistence).not.toHaveBeenCalled()
  expect(signInWithCustomToken).toHaveBeenCalledWith(auth, "token")
})
