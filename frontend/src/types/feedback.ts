import type { REPORT_REASONS } from "@/config/feedback"
import type { components } from "@/types/api/library"

type Schemas = components["schemas"]

export type ReportReason = (typeof REPORT_REASONS)[number]
export type QuestionReport = Schemas["ReportOut"]
// Interviews' questions also say whether an owner or admin left them out. `my_rating` and
// `reported` are what the reader did on this page: feedback is anonymous, so the API can't say.
export type QuestionStats = Schemas["QuestionText"] & {
  excluded?: boolean
  my_rating?: 1 | -1 | null
  reported?: boolean
}
