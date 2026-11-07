import type { Page } from "@playwright/test"

import { SCREENSHOTS } from "../constants"
import { api, templatesBySize } from "./api"
import { withDatabase } from "./db"
import { setScheme } from "./theme"

// The features page's pictures (frontend/public/features/): screens of the real app with made-up
// people, taken only with SHOTS=1 by specs/zz-features-shots.spec.ts, light and dark, at twice the
// pixels, then cropped and converted by scripts/features-shots.sh.

// The window the screens are taken in.
export const SHOT_VIEWPORT = { width: 1440, height: 900 }
// The window an email is shown in: a mail client's reading pane.
export const EMAIL_VIEWPORT = { width: 640, height: 560 }

// The role the interviews are for, and the template they're copied from when it's there.
export const SHOT_ROLE = "Senior Backend Engineer"
const SHOT_TEMPLATE = "Senior Backend Engineer (Platform)"

/** The screen as it is now, light and then dark, in screenshots/features/<name>-<scheme>.png,
 * each once `ready` holds when given; the page is left light. */
export async function pair(page: Page, name: string, ready?: () => Promise<void>) {
  for (const scheme of ["light", "dark"] as const) {
    await setScheme(page, scheme)
    await ready?.()
    // "disabled" runs the theme's colour transitions to their end before the picture.
    await page.screenshot({
      path: `${SCREENSHOTS}/features/${name}-${scheme}.png`,
      animations: "disabled",
      caret: "hide",
    })
  }

  await setScheme(page, "light")
}

// The topics picture's role and its template.
// The most subtopics a topic can have (MAX_SUBTOPICS's default, limit_list.py).
const MAX_SUBTOPICS = 5
export const SHOT_AI_ROLE = "AI Architect"
export const SHOT_AI_TEMPLATE = "Senior AI Engineer"

/** An interview for `role` in `companyId`, copied from `templateTitle` (or the largest template
 * there is), named after the role. */
export async function roleInterview(
  page: Page,
  companyId: string,
  role = SHOT_ROLE,
  templateTitle = SHOT_TEMPLATE,
) {
  const templates = await templatesBySize(page)
  const template =
    templates.find((item) => item.title === templateTitle) ?? templates[templates.length - 1]
  const interview = await api<{ id: string }>(
    page,
    "POST",
    `/companies/interviews/from-template?company_id=${companyId}`,
    { template_id: template.id },
  )
  await api(page, "PATCH", `/companies/interviews/${interview.id}/title`, { title: role })
  await keepSubtopicLimit(interview.id)

  return interview.id
}

/** An older local template may hold more subtopics than a new interview can: its copy, this
 * interview's own, is cut to what the product makes today. */
async function keepSubtopicLimit(interviewId: string) {
  const setId = await withDatabase("companies", async (client) => {
    const found = await client.query("SELECT set_id FROM interviews WHERE id = $1", [interviewId])

    return found.rows[0].set_id
  })
  await withDatabase("library", (client) =>
    client.query(
      `UPDATE topics SET subtopics = (
         SELECT jsonb_agg(value ORDER BY position)
         FROM jsonb_array_elements(subtopics) WITH ORDINALITY AS kept(value, position)
         WHERE position <= $2
       ) WHERE set_id = $1`,
      [setId, MAX_SUBTOPICS],
    ),
  )
}

/** The Slack connection's workspace and channel named like the made-up company's. */
export async function nameSlack(companyId: string, team: string) {
  await withDatabase("notifications", (client) =>
    client.query("UPDATE slack_connections SET team = $2 WHERE company_id = $1", [companyId, team]),
  )
}

// Northwind Labs' own colors, a teal brand in both themes, for the brand tab's picture.
export const SHOT_BRAND = {
  light: {
    background: "#ffffff",
    foreground: "#102a26",
    card: "#eef6f4",
    card_foreground: "#102a26",
    primary: "#0f766e",
    primary_foreground: "#ffffff",
    muted: "#eef6f4",
    muted_foreground: "#4b5e5a",
    border: "#d5e3df",
  },
  dark: {
    background: "#0b1513",
    foreground: "#e6f2ef",
    card: "#15231f",
    card_foreground: "#e6f2ef",
    primary: "#2dd4bf",
    primary_foreground: "#04201c",
    muted: "#15231f",
    muted_foreground: "#9fb7b1",
    border: "#24352f",
  },
}

/** Lumen Health's made-up logo, drawn in the browser and uploaded: square, as companies' logos
 * are, its sun mark over its name on white, so it reads as a logo on light and dark pages. */
export async function shotLogo(page: Page, companyId: string) {
  const image = await page.evaluate(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 512
    canvas.height = 512
    const context = canvas.getContext("2d")!
    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, 512, 512)
    // The sun: a disc and eight rays.
    context.fillStyle = "#f59e0b"
    context.beginPath()
    context.arc(256, 150, 44, 0, Math.PI * 2)
    context.fill()
    context.strokeStyle = "#f59e0b"
    context.lineWidth = 16
    context.lineCap = "round"

    for (let ray = 0; ray < 8; ray++) {
      const angle = (ray * Math.PI) / 4
      context.beginPath()
      context.moveTo(256 + Math.cos(angle) * 66, 150 + Math.sin(angle) * 66)
      context.lineTo(256 + Math.cos(angle) * 88, 150 + Math.sin(angle) * 88)
      context.stroke()
    }

    context.fillStyle = "#0f766e"
    context.textAlign = "center"
    context.textBaseline = "alphabetic"
    context.font = "700 124px system-ui, sans-serif"
    context.fillText("Lumen", 256, 362)
    context.font = "600 52px system-ui, sans-serif"
    context.letterSpacing = "14px"
    context.fillText("HEALTH", 263, 436)

    return canvas.toDataURL("image/png").split(",")[1]
  })
  await api(page, "PUT", `/companies/companies/${companyId}/logo`, { image })
}

/** Waits for a loud moment of Mira's voice: her wave's tallest bar over half its height. */
export async function miraLoud(page: Page) {
  await page.waitForFunction(
    () =>
      Math.max(
        ...[...document.querySelectorAll<HTMLElement>('[data-testid="mira-wave"] > span')].map(
          (bar) => Number(/scaleY\(([\d.]+)\)/.exec(bar.style.transform)?.[1] ?? 0),
        ),
      ) > 0.5,
    undefined,
    { polling: 16 },
  )
}

// The topics a senior accountant's job description gets, as the review shows them.
export const FLOW_TOPICS = [
  {
    main_topic: "Month-end close",
    subtopics: ["Accruals and prepayments", "Cut-off", "Close checklists"],
  },
  {
    main_topic: "Account reconciliations",
    subtopics: ["Bank reconciliations", "Intercompany balances", "Suspense accounts"],
  },
  { main_topic: "VAT compliance in the EU", subtopics: ["Returns", "Reverse charge", "OSS"] },
  { main_topic: "IFRS reporting", subtopics: ["Revenue (IFRS 15)", "Leases (IFRS 16)"] },
  { main_topic: "Management accounts", subtopics: ["Variance analysis", "Forecasts"] },
  { main_topic: "Audit support", subtopics: ["Year-end schedules", "Audit queries"] },
]

/** Turns a throwaway company's interview into one whose topics wait for review: a generation in
 * review in the generation database with `topics`, and the interview waiting on it, as companies
 * keeps it while its topics are reviewed. Returns the generation's id. */
export async function topicsInReview(interviewId: string, companyId: string, topics = FLOW_TOPICS) {
  const generationId = await withDatabase("generation", async (client) => {
    const found = await client.query(
      `INSERT INTO generations (id, owner_uid, kind, company_id, text, language, status, topics)
       VALUES (gen_random_uuid(), 'e2e', 'interview', $1, 'Senior Accountant', 'en',
               'awaiting_review', $2::jsonb)
       RETURNING id`,
      [companyId, JSON.stringify(topics)],
    )

    return found.rows[0].id as string
  })
  await withDatabase("companies", (client) =>
    client.query(
      "UPDATE interviews SET set_id = NULL, title = NULL, generation_id = $2 WHERE id = $1",
      [interviewId, generationId],
    ),
  )

  return generationId
}

type Step = {
  session: { id: string }
  question: { question_id: string; text: string; options: string[]; multi: boolean } | null
}

/** Starts the invite of the candidate signed in on `candidate` and answers its questions until a
 * "select all that apply" one without a code example comes up, which it leaves open. Returns that
 * question's session and the options its answer key marks right (from library). */
export async function reachMultiAnswer(candidate: Page, token: string) {
  const { sessions } = await api<{ sessions: { id: string }[] }>(
    candidate,
    "POST",
    `/companies/invites/${token}/start`,
    { pledged: true },
  )

  for (const section of sessions) {
    for (;;) {
      const step = await api<Step>(candidate, "POST", `/rounds/sessions/${section.id}/step`)

      if (!step.question) {
        break
      }

      if (step.question.multi && !step.question.text.includes("```")) {
        const right = await withDatabase("library", async (client) => {
          const found = await client.query<{ options: { answer: string; correct: boolean }[] }>(
            "SELECT options FROM questions WHERE id = $1",
            [step.question!.question_id],
          )

          return found.rows[0].options.filter((option) => option.correct).map((option) => option.answer)
        })

        return { sessionId: step.session.id, right }
      }

      await api(candidate, "POST", `/rounds/sessions/${step.session.id}/answers`, {
        question_id: step.question.question_id,
        option_index: 0,
      })
    }
  }

  throw new Error("No multi-answer question without an example in this interview")
}

