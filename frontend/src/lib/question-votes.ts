import { apiFetch } from "@/lib/api"
import type { QuestionStats } from "@/types/feedback"

export type Thumb = 1 | -1

/** The vote after a click on `clicked`: the other thumb switches it, the same one takes it back. */
export function nextVote(current: Thumb | null, clicked: Thumb): Thumb | null {
  return current === clicked ? null : clicked
}

/** Saves a vote in place of `previous`. Votes are anonymous, so only this page knows what its
 * reader voted, and a reload or a later visit starts with no vote. */
export async function saveVote(
  ratingPath: string,
  previous: Thumb | null,
  value: Thumb | null
) {
  await apiFetch(ratingPath, {
    method: "PUT",
    body: JSON.stringify({ value, previous }),
  })
}

/** A question's counts after its reader's vote goes from `my_rating` to `next`. */
export function withVote(
  question: QuestionStats,
  next: Thumb | null
): QuestionStats {
  const was = question.my_rating

  return {
    ...question,
    my_rating: next,
    likes: question.likes + (next === 1 ? 1 : 0) - (was === 1 ? 1 : 0),
    dislikes: question.dislikes + (next === -1 ? 1 : 0) - (was === -1 ? 1 : 0),
  }
}
