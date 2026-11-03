import { beforeEach, describe, expect, it, vi } from "vitest"

import { SEARCH_RESULTS } from "@/config/search"
import { apiFetch } from "@/lib/api"
import { searchSite } from "@/lib/search"
import type { OwnResult, SiteResult } from "@/types/search"

vi.mock("@/lib/api", () => ({ apiFetch: vi.fn() }))

const COMPANY: OwnResult = {
  kind: "company",
  title: "Acme",
  company_id: "c1",
  company: "Acme",
  interview: null,
  interview_id: null,
  invite_id: null,
}
const INTERVIEW: OwnResult = {
  ...COMPANY,
  kind: "interview",
  title: "Backend developer",
  interview_id: "i1",
}
const CANDIDATE: OwnResult = {
  ...INTERVIEW,
  kind: "candidate",
  title: "Ada Lovelace",
  interview: "Backend developer",
  invite_id: "v1",
}
const PAGE: SiteResult = { kind: "page", title: "Pricing", path: "/pricing" }

// Each source answers what `answers` holds for it, or fails when it holds an error.
function answer(answers: { own?: unknown; site?: unknown; tests?: unknown }) {
  vi.mocked(apiFetch).mockImplementation(async (path: string) => {
    const source = path.startsWith("/companies/")
      ? answers.own
      : path.startsWith("/site/")
        ? answers.site
        : answers.tests

    if (source instanceof Error) {
      throw source
    }

    return source ?? []
  })
}

function paths() {
  return vi.mocked(apiFetch).mock.calls.map(([path]) => path as string)
}

beforeEach(() => {
  vi.mocked(apiFetch).mockReset()
})

describe("searchSite", () => {
  it("asks only the site and the tests when signed out", async () => {
    answer({ own: [COMPANY], site: [PAGE] })

    const found = await searchSite("acme", "en", false)

    expect(paths().some((path) => path.startsWith("/companies/"))).toBe(false)
    expect(paths()).toHaveLength(2)
    expect(found.map((item) => item.kind)).toEqual(["page"])
  })

  it("asks the user's companies too when signed in", async () => {
    answer({ own: [COMPANY] })

    await searchSite("a b", "en", true)

    expect(paths()).toContain("/companies/search?q=a%20b")
    expect(paths()).toContain("/site/search?q=a%20b")
  })

  it("orders the user's own results, then the site, then the tests, at most SEARCH_RESULTS", async () => {
    answer({
      own: [COMPANY, INTERVIEW],
      site: [PAGE],
      tests: [
        { slug: "python", title: "Python developer" },
        { slug: "go", title: "Go developer" },
        { slug: "java", title: "Java developer" },
      ],
    })

    const found = await searchSite("dev", "en", true)

    expect(found).toHaveLength(SEARCH_RESULTS)
    expect(found.map((item) => item.kind)).toEqual([
      "company",
      "interview",
      "page",
      "test",
      "test",
    ])
    expect(found.slice(3).map((item) => item.path)).toEqual([
      "/tests/python",
      "/tests/go",
    ])
  })

  it("opens each own result on its page, under where it belongs", async () => {
    answer({ own: [COMPANY, INTERVIEW, CANDIDATE] })

    const found = await searchSite("acme", "en", true)

    expect(found.map(({ path, context }) => ({ path, context }))).toEqual([
      { path: "/companies/c1/interviews", context: undefined },
      { path: "/companies/c1/interviews/i1", context: ["Acme"] },
      {
        path: "/companies/c1/interviews/i1/candidates/v1",
        context: ["Acme", "Backend developer"],
      },
    ])
  })

  it("leaves out a source that fails", async () => {
    answer({ own: new Error("down"), site: [PAGE], tests: new Error("down") })

    const found = await searchSite("pricing", "en", true)

    expect(found.map((item) => item.path)).toEqual(["/pricing"])
  })

  it("skips tests without a page", async () => {
    answer({
      tests: [
        { slug: null, title: "Draft" },
        { slug: "python", title: "Python developer" },
      ],
    })

    const found = await searchSite("python", "en", false)

    expect(found.map((item) => item.path)).toEqual(["/tests/python"])
  })

  it("asks for tests in the interface's language and English, each once", async () => {
    answer({})

    await searchSite("python", "de", false)
    await searchSite("python", "en", false)

    const [german, english] = paths().filter(
      (path) => !path.startsWith("/site/")
    )

    expect(german.match(/language=/g)).toHaveLength(2)
    expect(german).toContain("language=de")
    expect(german).toContain("language=en")
    expect(english.match(/language=/g)).toHaveLength(1)
    expect(english).toContain("language=en")
  })
})
