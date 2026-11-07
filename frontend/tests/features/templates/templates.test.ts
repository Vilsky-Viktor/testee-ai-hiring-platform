import { describe, expect, it } from "vitest"

import {
  hubPage,
  templateChoice,
  templateQuery,
} from "@/features/templates/utils/templates"
import type { TemplateFilters } from "@/types/superadmin"

const filters = {
  levels: ["junior", "senior"],
  languages: ["en", "de", "fr"],
} as unknown as TemplateFilters

describe("templateChoice", () => {
  it("keeps only the level and languages the API offers", () => {
    const choice = templateChoice(
      { q: "  python  ", level: "expert" },
      ["de", "xx"],
      ["de", "xx"],
      filters
    )

    expect(choice).toEqual({ q: "python", level: null, languages: ["de"] })
  })

  it("means every language when all are asked for", () => {
    const choice = templateChoice({ level: "senior" }, ["all"], [], filters)

    expect(choice).toEqual({ q: "", level: "senior", languages: [] })
  })
})

describe("templateQuery", () => {
  it("sends the search, the level and each language", () => {
    const query = templateQuery({
      q: "sql",
      level: "junior",
      languages: ["en", "fr"],
    })

    expect(query.toString()).toBe("q=sql&level=junior&language=en&language=fr")
  })

  it("leaves out what wasn't chosen", () => {
    expect(
      templateQuery({ q: "", level: null, languages: [] }).toString()
    ).toBe("")
  })
})

describe("hubPage", () => {
  it("takes a whole number from 1", () => {
    expect(hubPage({ page: "3" })).toBe(3)
    expect(hubPage({ page: "1" })).toBe(1)
  })

  it.each(["0", "-2", "2.5", "two", "", "1234567"])(
    "reads %j as the first page",
    (page) => {
      expect(hubPage({ page })).toBe(1)
    }
  )

  it("has the first page only, once the list is searched or filtered", () => {
    expect(hubPage({ page: "3", q: "python" })).toBe(1)
    expect(hubPage({ page: "3", level: "senior" })).toBe(1)
    expect(hubPage({ page: "3", lang: ["de"] })).toBe(1)
    expect(hubPage({ page: "3", q: "   " })).toBe(3)
  })
})
