/** A page the header's search found: in the user's companies (companies) or on the public site
 * (site), or a role's skills test (library); `path` is where it opens. */
export type SearchKind =
  | "company"
  | "interview"
  | "candidate"
  | "page"
  | "guide"
  | "comparison"
  | "legal"
  | "faq"
  | "test"

export type SearchResult = {
  key: string
  kind: SearchKind
  title: string
  path: string
  // Where it belongs, under the title: a candidate's company and interview, an interview's
  // company.
  context?: string[]
}

// What companies answers: the ids each page is built from.
export type OwnResult = {
  kind: "company" | "interview" | "candidate"
  title: string
  company_id: string
  company: string
  interview: string | null
  interview_id: string | null
  invite_id: string | null
}

export type SiteResult = { kind: SearchKind; title: string; path: string }
