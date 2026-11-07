import { describe, expect, it } from "vitest"

import { nextVote, withVote } from "@/lib/question-votes"
import type { QuestionStats } from "@/types/feedback"

function question(overrides: Partial<QuestionStats> = {}): QuestionStats {
  return {
    id: crypto.randomUUID(),
    text: "What does HTTP 404 mean?",
    options: [],
    multi: false,
    likes: 4,
    dislikes: 2,
    reports: 0,
    my_rating: null,
    reported: false,
    ...overrides,
  }
}

describe("nextVote", () => {
  it("sets a vote when there is none", () => {
    expect(nextVote(null, 1)).toBe(1)
    expect(nextVote(null, -1)).toBe(-1)
  })

  it("switches to the other thumb", () => {
    expect(nextVote(1, -1)).toBe(-1)
    expect(nextVote(-1, 1)).toBe(1)
  })

  it("takes the vote back on the same thumb", () => {
    expect(nextVote(1, 1)).toBeNull()
    expect(nextVote(-1, -1)).toBeNull()
  })
})

describe("withVote", () => {
  it("adds a new like", () => {
    expect(withVote(question(), 1)).toMatchObject({
      my_rating: 1,
      likes: 5,
      dislikes: 2,
    })
  })

  it("adds a new dislike when no vote was loaded", () => {
    expect(withVote(question({ my_rating: undefined }), -1)).toMatchObject({
      my_rating: -1,
      likes: 4,
      dislikes: 3,
    })
  })

  it("moves a like to a dislike", () => {
    expect(withVote(question({ my_rating: 1 }), -1)).toMatchObject({
      my_rating: -1,
      likes: 3,
      dislikes: 3,
    })
  })

  it("removes a taken-back vote", () => {
    expect(withVote(question({ my_rating: -1 }), null)).toMatchObject({
      my_rating: null,
      likes: 4,
      dislikes: 1,
    })
  })

  it("keeps the rest of the question", () => {
    const before = question({ reports: 3, reported: true, excluded: true })

    expect(withVote(before, 1)).toEqual({
      ...before,
      my_rating: 1,
      likes: 5,
    })
  })
})
