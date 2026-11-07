import { describe, expect, it, vi } from "vitest"

import {
  ApiError,
  apiErrorMessage,
  checkedResponse,
  errorDetail,
  serviceRefusal,
} from "@/lib/api"

vi.mock("@/lib/firebase", () => ({ firebaseAuth: async () => ({}) }))

describe("errorDetail", () => {
  it("takes the message a service raised", () => {
    expect(errorDetail({ detail: "Company not found" })).toBe(
      "Company not found"
    )
  })

  it("takes the first validation error, without pydantic's prefix", () => {
    const body = {
      detail: [
        { msg: "Value error, Too many emails" },
        { msg: "Field required" },
      ],
    }

    expect(errorDetail(body)).toBe("Too many emails")
  })

  it("gives none for any other body", () => {
    expect(errorDetail(null)).toBeNull()
    expect(errorDetail({})).toBeNull()
    expect(errorDetail({ detail: [] })).toBeNull()
    expect(errorDetail({ detail: [{ loc: ["body"] }] })).toBeNull()
    expect(errorDetail({ detail: 42 })).toBeNull()
  })
})

describe("serviceRefusal and apiErrorMessage", () => {
  it("show the service's own message for the statuses asked", () => {
    const refused = new ApiError(
      429,
      "Too many requests. Try again later.",
      true
    )

    expect(serviceRefusal(refused, [429])).toBe(
      "Too many requests. Try again later."
    )
    expect(serviceRefusal(refused, [409])).toBeNull()
    expect(apiErrorMessage(refused, "Couldn't send.")).toBe(
      "Too many requests. Try again later."
    )
  })

  it("never show a load balancer's page, only the fallback", () => {
    const busy = new ApiError(429, "Request failed with status 429")

    expect(serviceRefusal(busy, [429])).toBeNull()
    expect(apiErrorMessage(busy, "Couldn't send.")).toBe("Couldn't send.")
  })
})

describe("checkedResponse", () => {
  async function refusal(headers: Record<string, string>) {
    const response = new Response(JSON.stringify({ detail: "Too many" }), {
      status: 429,
      headers,
    })

    return checkedResponse(response).catch((error: ApiError) => error)
  }

  it("keeps how long the service said to wait", async () => {
    expect(await refusal({ "Retry-After": "1800" })).toMatchObject({
      status: 429,
      retryAfter: 1800,
    })
  })

  it("has no wait when the service gave none, or not as seconds", async () => {
    expect(await refusal({})).toMatchObject({ retryAfter: null })
    expect(await refusal({ "Retry-After": "soon" })).toMatchObject({
      retryAfter: null,
    })
  })
})
