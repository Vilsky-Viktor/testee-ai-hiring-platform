import type { REPORT_REASONS } from "@/config/feedback"
import type { components } from "@/types/api/library"

type Schemas = components["schemas"]

export type ReportReason = (typeof REPORT_REASONS)[number]
export type QuestionReport = Schemas["ReportOut"]
// Interviews' questions also say whether an owner or admin left them out.
export type QuestionStats = Schemas["QuestionText"] & { excluded?: boolean }
