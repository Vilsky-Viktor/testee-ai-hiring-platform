import { describe, expect, it } from "vitest"

import { onlyDigits } from "@/lib/digits"

describe("onlyDigits", () => {
  it("keeps 0 to 9 and drops the rest", () => {
    expect(onlyDigits("1,5a0")).toBe("150")
  })

  it("reads the digits of Arabic, Persian, Hindi and Thai keyboards", () => {
    expect(onlyDigits("٢٥٠")).toBe("250")
    expect(onlyDigits("۲۵۰")).toBe("250")
    expect(onlyDigits("२५०")).toBe("250")
    expect(onlyDigits("๒๕๐")).toBe("250")
  })
})
