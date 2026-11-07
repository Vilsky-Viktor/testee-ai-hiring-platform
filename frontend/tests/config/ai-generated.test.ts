import { describe, expect, it } from "vitest"

import { AI_GENERATED } from "@/config/ai-generated"

describe("AI_GENERATED", () => {
  it("names IPTC's term for generative AI, as machines look it up", () => {
    expect(AI_GENERATED).toEqual({
      "data-ai-generated": "true",
      "data-digital-source-type":
        "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia",
    })
  })
})
