import { readFileSync } from "node:fs"

import { describe, expect, it } from "vitest"

import { REFERRAL_CODE, REFERRAL_COOKIE } from "@/config/referral"

const SHARED = readFileSync(
  new URL(
    "../../../packages/common/src/testee_common/config/constants.py",
    import.meta.url
  ),
  "utf8"
)

describe("referral", () => {
  it("matches the shared constants the backend reads", () => {
    const pattern = /REFERRAL_CODE_PATTERN = r"([^"]+)"/.exec(SHARED)?.[1]

    expect(REFERRAL_CODE.source).toBe(`^${pattern}$`)
    expect(SHARED).toContain(`REFERRAL_COOKIE = "${REFERRAL_COOKIE}"`)
  })
})
