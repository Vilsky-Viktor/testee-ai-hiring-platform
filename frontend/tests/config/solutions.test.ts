import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { createTranslator } from "next-intl"
import { describe, expect, it } from "vitest"

import { LOCALES } from "@/config/i18n"
import { LOCALIZED_PATHS, PUBLIC_PATHS } from "@/config/seo"
import { SOLUTIONS } from "@/config/solutions"

import { FRONTEND, SOURCE_ROOT } from "../source-files"

// What a search result shows: the title with the layout's " · testee." and the description.
const MAX_TITLE = 60 - " · testee.".length
const MAX_DESCRIPTION = 155

describe("the solution pages", () => {
  it("have an address in every language, under /guides, each with its page", () => {
    for (const { path } of SOLUTIONS) {
      expect(path).toMatch(/^\/guides\//)
      expect(LOCALIZED_PATHS).toContain(path)
      expect(PUBLIC_PATHS).toContain(path)
      expect(readdirSync(join(SOURCE_ROOT, "app", path))).toContain("page.tsx")
    }
  })

  it.each(LOCALES)("fit search results in %s", (locale) => {
    const messages = JSON.parse(
      readFileSync(join(FRONTEND, "messages", `${locale}.json`), "utf8")
    )
    const t = createTranslator({ locale, messages, namespace: "solutions" })

    for (const { id } of SOLUTIONS) {
      expect(t(`pages.${id}.title`).length).toBeLessThanOrEqual(MAX_TITLE)
      expect(
        t(`pages.${id}.description`, { count: LOCALES.length }).length
      ).toBeLessThanOrEqual(MAX_DESCRIPTION)
    }
  })
})
