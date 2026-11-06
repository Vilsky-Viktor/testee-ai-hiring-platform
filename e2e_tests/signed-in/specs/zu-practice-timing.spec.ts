import { expect, test } from "../fixtures"
import { api } from "../helpers/api"
import { addTemplate, deleteTemplate } from "../helpers/db-library"
import { visit } from "../helpers/navigation"
import { throwawayEmail } from "../helpers/users"

type Size = {
  questions: number
  topics: Record<string, number>
  timings: { id: string; seconds: number | null }[]
}

// Practice measures nothing, so a talent can take more time or none (WCAG 2.2.1): the options
// come from the API, the picker beside the start shows the chosen one, and an untimed round has
// no countdown. A topic not started yet reads 0 of the questions a round asks on it.
test("a practice round takes the time per question the talent picks", async ({
  signInAs,
}) => {
  const talent = await signInAs(throwawayEmail("practice-timing"))
  const templateId = await addTemplate("E2E practice timing", 3, "practice")

  try {
    const { questions, topics, timings } = await api<Size>(
      talent,
      "GET",
      `/rounds/practice/${templateId}/size`
    )
    expect(timings.map((timing) => timing.id)).toEqual([
      "standard",
      "double",
      "untimed",
    ])
    expect(timings[1].seconds).toBe(timings[0].seconds! * 2)
    expect(timings[2].seconds).toBeNull()

    // One topic of 3 questions: the round asks all 3 on it.
    expect(questions).toBe(3)
    expect(Object.values(topics)).toEqual([3])

    await visit(talent, `/practice/${templateId}`)
    await expect(talent.getByRole("main").getByTestId("count")).toHaveText("0 / 3")
    const picker = talent.getByTestId("practice-timing")
    await expect(picker).toContainText(String(timings[0].seconds))
    await picker.click()
    await expect(talent.getByRole("menuitemradio")).toHaveCount(3)
    await talent.getByRole("menuitemradio").nth(1).click()
    await expect(picker).toContainText(String(timings[1].seconds))

    await picker.click()
    await talent.getByRole("menuitemradio").nth(2).click()
    await talent.getByTestId("start-practice").click()

    // The round's first question, with no countdown.
    await expect(talent.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 60_000,
    })
    await expect(talent.getByRole("timer")).toHaveCount(0)
  } finally {
    await deleteTemplate(templateId)
  }
})

// A "done / total" counter keeps its numbers in order on right-to-left pages too, never mirrored
// to "3 / 0": the answered number sits to the left of the total.
test("a practice topic's counter reads answered, then total, in Arabic", async ({
  signInAs,
}) => {
  const talent = await signInAs(throwawayEmail("practice-rtl"))
  // Only a template's own language has its page in that language.
  const templateId = await addTemplate("E2E practice counter", 3, "practice", "basic", "ar")

  try {
    await visit(talent, `/ar/practice/${templateId}`)
    await expect(talent.locator("html")).toHaveAttribute("dir", "rtl")
    const count = talent.getByRole("main").getByTestId("count")
    await expect(count).toHaveText("0 / 3")
    // Where each number starts on screen.
    const [answered, total] = await count.evaluate((element) => {
      const numbers = [...element.childNodes].filter((node) => node.textContent?.trim())
      const left = (node: Node) => {
        const range = document.createRange()
        range.selectNodeContents(node)

        return range.getBoundingClientRect().left
      }

      return [left(numbers[0]), left(numbers[numbers.length - 1])]
    })
    expect(answered).toBeLessThan(total)
  } finally {
    await deleteTemplate(templateId)
  }
})
