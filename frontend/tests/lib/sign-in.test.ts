import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const sendEmailVerification = vi.hoisted(() => vi.fn())
const user = vi.hoisted(() => ({
  email: "ann@example.com",
  emailVerified: false,
}))
const auth = vi.hoisted(() => ({ languageCode: null as string | null }))

vi.mock("@/lib/firebase", () => ({ firebaseAuth: async () => auth }))
vi.mock("firebase/auth", () => ({
  GithubAuthProvider: class {
    addScope() {}
  },
  signInWithPopup: async () => ({ user }),
  sendEmailVerification,
}))

import { signIn } from "@/lib/auth"

describe("signIn with an unverified email", () => {
  beforeEach(() => {
    vi.stubGlobal("document", { documentElement: { lang: "de" } })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("says the link to verify it was sent", async () => {
    sendEmailVerification.mockResolvedValueOnce(undefined)

    expect(await signIn("github")).toBe("verify")
  })

  it("sends the link in the page's language", async () => {
    sendEmailVerification.mockImplementationOnce(async () => {
      expect(auth.languageCode).toBe("de")
    })

    await signIn("github")

    expect.assertions(1)
  })

  it("says so when the link couldn't be sent", async () => {
    sendEmailVerification.mockRejectedValueOnce(
      new Error("auth/too-many-requests")
    )

    expect(await signIn("github")).toBe("verifyFailed")
  })
})
