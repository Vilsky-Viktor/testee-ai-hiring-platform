import type { Page } from "@playwright/test"

import { api } from "./api"
import { inviteToken, withDatabase } from "./db"
import { shapeAnswers } from "./db-rounds"
import { redis } from "./redis"
import { throwawayEmail } from "./users"

// The made-up candidates of the features page's pictures (specs/zz-features-shots.spec.ts): each
// takes the interview for real by API, so the list and the reports show what rounds computes;
// their answers are then made right or wrong in the rounds database for the grade wanted, and
// their throwaway address is replaced by a made-up one once nothing more is emailed to them.

type Person = {
  name: string
  // The share of answers made right; none for answers that read as relayed to an AI.
  share: number | null
  // How far they got: invited only, part of the way, or finished.
  state: "invited" | "started" | "finished"
}

export const PEOPLE: Person[] = [
  { name: "Daniel Brooks", share: null, state: "finished" },
  { name: "Maya Chen", share: 0.98, state: "finished" },
  { name: "Lucas Ferreira", share: 0.92, state: "finished" },
  { name: "Sara Lindqvist", share: 0.86, state: "finished" },
  { name: "Tom Becker", share: 0.64, state: "finished" },
  { name: "Omar Haddad", share: 0.7, state: "started" },
  { name: "Julia Novak", share: null, state: "invited" },
]

// How many questions a candidate who's part of the way has answered.
const STARTED_ANSWERS = 20

type Step = { session: { id: string }; question: { question_id: string } | null }

/** A made-up person's address on the reserved example domain. */
export function exampleEmail(name: string) {
  return `${name.toLowerCase().replace(" ", ".")}@example.com`
}

/** Makes a random `share` of each of the invite's sections' answers right (when given), each
 * taking a person's time (15 to 50 seconds, as the API answered them at once), and
 * each finished section's score what its answers add up to, as rounds scores it at the end. */
async function scoreAnswers(inviteId: string, share: number | null) {
  await withDatabase("rounds", async (client) => {
    const sessions = await client.query<{ id: string }>(
      "SELECT id FROM sessions WHERE candidate_invite_id = $1",
      [inviteId],
    )

    for (const { id } of sessions.rows) {
      if (share !== null) {
        await client.query(
          `UPDATE answers SET correct = ranked.position <= ranked.total * $2::float,
             score = CASE WHEN ranked.position <= ranked.total * $2::float THEN 100 ELSE 0 END,
             seconds = 15 + floor(random() * 35)
           FROM (SELECT id, row_number() OVER (ORDER BY random()) AS position,
                   count(*) OVER () AS total
                 FROM answers WHERE session_id = $1) AS ranked
           WHERE answers.id = ranked.id`,
          [id, share],
        )
      }

      await client.query(
        `UPDATE sessions SET final_score = (SELECT round(avg(score)) FROM answers
           WHERE session_id = $1) WHERE id = $1 AND status = 'finished'`,
        [id],
      )
    }
  })
}

/** Invites `person` to the interview and has them take it as far as their state says: Daniel
 * leaves the page and copies once, and his answers read as relayed to an AI. The interview's
 * count of emails to the tests' shared inbox is reset first: it's the test's own key, and every
 * throwaway address shares that inbox. Returns the invite's id. */
export async function takePart(
  signInAs: (email: string) => Promise<Page>,
  owner: Page,
  interviewId: string,
  person: Person,
) {
  const email = throwawayEmail("shot")
  await redis("DEL", `rate:emails:recipient:${interviewId}:delivered@resend.dev`)
  await api(owner, "POST", `/companies/interviews/${interviewId}/candidates`, {
    email,
    name: person.name,
  })

  if (person.state !== "invited") {
    await answer(await signInAs(email), email, person)
  }

  const rows = await api<{ id: string; email: string }[]>(
    owner,
    "GET",
    `/companies/interviews/${interviewId}/candidates`,
  )
  const id = rows.find((row) => row.email === email)!.id

  if (person.share === null && person.state === "finished") {
    await shapeAnswers(id, true)
  }

  await scoreAnswers(id, person.share)
  await withDatabase("companies", (client) =>
    client.query("UPDATE candidate_invites SET email = $2 WHERE id = $1", [
      id,
      exampleEmail(person.name),
    ]),
  )

  return id
}

/** The candidate signed in on `candidate` starts and answers, as the app's player does. */
async function answer(candidate: Page, email: string, person: Person) {
  const { sessions } = await api<{ sessions: { id: string }[] }>(
    candidate,
    "POST",
    `/companies/invites/${await inviteToken(email)}/start`,
    { pledged: true },
  )
  let answered = 0

  for (const section of sessions) {
    for (;;) {
      const step = await api<Step>(candidate, "POST", `/rounds/sessions/${section.id}/step`)

      if (person.state === "started" && answered === STARTED_ANSWERS) {
        return
      }

      if (!step.question) {
        break
      }

      if (answered === 0 && person.share === null) {
        const signals = `/rounds/sessions/${step.session.id}/signals`
        await api(candidate, "POST", signals, { kind: "tab_leave" })
        await api(candidate, "POST", signals, { kind: "tab_return", seconds: 14 })
        await api(candidate, "POST", signals, { kind: "copy" })
      }

      await api(candidate, "POST", `/rounds/sessions/${step.session.id}/answers`, {
        question_id: step.question.question_id,
        option_index: 0,
      })
      answered += 1
    }
  }

  if (person.state === "finished") {
    await api(candidate, "POST", `/rounds/sessions/${sessions[0].id}/finish-interview`)
  }
}

/** Gives each of a finished candidate's sections, in order, its own share of right answers
 * (`shares`, repeated), so their topics' grades differ: each answer's pick is set to match, the
 * right options for a right one and a wrong one otherwise (single and multi-answer alike), and
 * each section's score what its answers add up to, as rounds scores them. */
export async function spreadSections(inviteId: string, shares: number[]) {
  type Option = { correct: boolean }
  type Question = { id: string; options: Option[] }

  await withDatabase("rounds", async (client) => {
    const sessions = await client.query<{ id: string; questions: Question[] }>(
      "SELECT id, questions FROM sessions WHERE candidate_invite_id = $1 ORDER BY started_at, id",
      [inviteId],
    )

    for (const [index, session] of sessions.rows.entries()) {
      const answers = await client.query<{ id: string; question_id: string; picks: number[] | null }>(
        "SELECT id, question_id, picks FROM answers WHERE session_id = $1 ORDER BY created_at, id",
        [session.id],
      )
      const right = Math.round(answers.rows.length * shares[index % shares.length])

      for (const [position, answer] of answers.rows.entries()) {
        const options = session.questions.find((item) => item.id === answer.question_id)?.options ?? []
        const correct = position < right
        const keyed = options.flatMap((option, at) => (option.correct === correct ? [at] : []))
        const picks = correct ? keyed : keyed.slice(0, 1)
        await client.query(
          `UPDATE answers SET correct = $2, score = $3, option_index = $4, picks = $5
           WHERE id = $1`,
          [
            answer.id,
            correct,
            correct ? 100 : 0,
            answer.picks ? null : (picks[0] ?? 0),
            answer.picks ? picks : null,
          ],
        )
      }

      await client.query(
        `UPDATE sessions SET final_score = (SELECT round(avg(score)) FROM answers
           WHERE session_id = $1) WHERE id = $1 AND status = 'finished'`,
        [session.id],
      )
    }
  })
}
