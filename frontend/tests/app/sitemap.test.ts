import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import sitemap from "@/app/sitemap"
import { PAGE_SIZE } from "@/config/lists"
import { publicFetch } from "@/lib/server-api"

// One guide in English and German, each language's file dated on its own; no templates, and the
// API's news and legal dates unanswered.
vi.mock("@/lib/content", () => ({
  contentPages: vi.fn(async (folder: string) =>
    folder === "guides" ? [{ slug: "dated", updated: "2026-01-01" }] : []
  ),
  contentLanguages: vi.fn(async () => ["en", "de"]),
  contentPage: vi.fn(async (_folder: string, slug: string, locale: string) => ({
    slug,
    language: locale,
    updated: locale === "de" ? "2026-02-02" : "2026-01-01",
  })),
}))
vi.mock("@/lib/server-api", () => ({ publicFetch: vi.fn(async () => []) }))

describe("sitemap", () => {
  beforeEach(() => {
    vi.stubEnv("SITE_URL", "https://testee.example")
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(null, { status: 503 }))
    )
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it("dates each language of an article by its own file", async () => {
    const entries = await sitemap()
    const date = (url: string) =>
      entries.find((entry) => entry.url === url)?.lastModified

    expect(date("https://testee.example/guides/dated")).toBe("2026-01-01")
    expect(date("https://testee.example/de/guides/dated")).toBe("2026-02-02")
  })

  it("lists a hub's numbered pages past the first, counting what each language lists", async () => {
    const rows = Array.from({ length: PAGE_SIZE + 1 }, (_, index) => ({
      slug: `role-${index}`,
      language: "en",
      indexable: true,
    }))
    vi.mocked(publicFetch).mockResolvedValueOnce([
      ...rows,
      { slug: "thin", language: "en", indexable: false },
      { slug: "rolle", language: "de", indexable: true },
    ])
    const urls = (await sitemap()).map((entry) => entry.url)
    const site = "https://testee.example"

    for (const hub of ["/tests", "/practice"]) {
      expect(urls).toContain(`${site}${hub}?page=2`)
      expect(urls).not.toContain(`${site}${hub}?page=3`)
      expect(urls).toContain(`${site}/de${hub}?page=2`)
    }
  })

  it("lists no numbered pages when a hub fits on one", async () => {
    const urls = (await sitemap()).map((entry) => entry.url)

    expect(urls.filter((url) => url.includes("?page="))).toEqual([])
  })

  it("names every language's address of a page in absolute hreflang codes", async () => {
    const entries = await sitemap()
    const pricing = entries.find(
      (entry) => entry.url === "https://testee.example/fil/pricing"
    )

    expect(pricing?.alternates?.languages).toMatchObject({
      tl: "https://testee.example/fil/pricing",
      "zh-Hans": "https://testee.example/zh/pricing",
      "x-default": "https://testee.example/pricing",
    })
  })
})
