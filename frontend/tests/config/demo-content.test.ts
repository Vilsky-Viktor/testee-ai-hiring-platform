import { readFileSync, readdirSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

import {
  STEPS,
  adjusted,
  createSteps,
  WRITTEN,
} from "@/config/create-demo-steps"
import { DEMO_EDITED, DEMO_EDITED_SUBTOPIC } from "@/config/create-demo"
import { reportCandidates } from "@/config/reports-demo"
import type { DemoContent } from "@/features/landing/types/demo-content"

// The landing demos' texts in every language (`landing.demoContent`): what the demos compute
// from them holds whatever the language.
const DIR = path.resolve(__dirname, "../../messages")
const CODES = readdirSync(DIR).map((name) => name.replace(".json", ""))

function content(code: string): DemoContent {
  return JSON.parse(readFileSync(path.join(DIR, `${code}.json`), "utf8"))
    .landing.demoContent
}

describe.each(CODES)("%s", (code) => {
  const { create, reports } = content(code)

  it("types each of the create demo's texts a letter a step, every step in its place", () => {
    const steps = createSteps(create)
    const repeat = (name: string) =>
      steps.find((step) => step.name === name)?.repeat

    expect(steps.map(({ name }) => name)).toEqual(STEPS.map(({ name }) => name))
    expect(repeat("renaming")).toBe(create.renamed.length)
    expect(repeat("adding")).toBe(create.subtopicAdded.length)
    expect(repeat("asking")).toBe(create.change.length)
  })

  it("writes the questions for the topics as adjusted: the edited one as typed, the AI's added", () => {
    const topics = Object.values(create.topics)
    const written = adjusted(create)

    expect(written).toHaveLength(WRITTEN)
    expect(written[DEMO_EDITED].name).toBe(
      topics[DEMO_EDITED].name + create.renamed
    )
    expect(written[DEMO_EDITED].subtopics[DEMO_EDITED_SUBTOPIC]).toBe(
      topics[DEMO_EDITED].subtopics[DEMO_EDITED_SUBTOPIC] + create.subtopicAdded
    )
    expect(written.at(-1)).toEqual(create.newTopic)
  })

  it("gives the report demo's candidates their topics and the follow-up in the language", () => {
    const flagged = reportCandidates(reports)[1]

    expect(flagged.topics?.map(({ title }) => title)).toEqual(reports.topics)
    expect(flagged.patterns?.followUp).toEqual({
      topic: reports.topics[1],
      text: reports.questions.metrics.text,
      right: reports.questions.metrics.options[1],
      wrong: reports.questions.metrics.options[0],
    })
  })
})
