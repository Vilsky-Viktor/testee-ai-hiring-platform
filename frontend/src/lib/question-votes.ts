import type { QuestionStats } from "@/types/feedback"

export type Thumb = 1 | -1

/** The vote after a click on `clicked`: the other thumb switches it, the same one takes it back. */
export function nextVote(current: Thumb | null, clicked: Thumb): Thumb | null {
  return current === clicked ? null : clicked
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
