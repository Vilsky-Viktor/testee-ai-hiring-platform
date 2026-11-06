import { ACTION_FILTERS } from "@/config/action-log"
import { candidateHref } from "@/lib/candidate-links"
import type { CompanyAction } from "@/types/company"

/** Who took an action, as the log names them: a member by email, a former member, an API key
 * by its name now, or a deleted key; a key with the way it came (the API when none is given). */
export type ActionAuthor =
  | { kind: "member"; email: string }
  | { kind: "former" }
  | { kind: "key"; name: string; via: string }
  | { kind: "deletedKey"; via: string }

/** The action log's filters the address gives (member, group of actions, from and to), for
 * the API; empty ones are left out. */
export function actionFilters(
  asked: Record<string, string | undefined>
): URLSearchParams {
  const filters = new URLSearchParams()

  for (const name of ACTION_FILTERS) {
    const value = asked[name]

    if (value) {
      filters.set(name, value)
    }
  }

  return filters
}

/** What a row of the log opens: the candidate, the interview or the team page, while it's still
 * there; nothing for the others. */
export function actionHref(
  action: Pick<
    CompanyAction,
    "interview_id" | "target" | "target_id" | "target_kind"
  >,
  companyId: string
) {
  const { interview_id: interviewId, target_id: targetId } = action

  if (action.target_kind === "candidate" && interviewId && targetId) {
    return candidateHref("company", companyId, {
      interview_id: interviewId,
      invite_id: targetId,
    })
  }

  if (action.target_kind === "interview" && interviewId) {
    return `/companies/${companyId}/interviews/${interviewId}`
  }

  return action.target_kind === "member" && action.target
    ? `/companies/${companyId}/members`
    : null
}

/** Who took `action` (see `ActionAuthor`). */
export function actionAuthor(
  action: Pick<CompanyAction, "key_id" | "key_name" | "user_email" | "via">
): ActionAuthor {
  if (!action.key_id) {
    return action.user_email
      ? { kind: "member", email: action.user_email }
      : { kind: "former" }
  }

  const via = action.via ?? "api"

  return action.key_name
    ? { kind: "key", name: action.key_name, via }
    : { kind: "deletedKey", via }
}
