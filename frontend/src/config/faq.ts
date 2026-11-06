// The FAQ page's groups, in order, with their questions' keys in the order they're read. A new
// question goes to the last group until it's listed here.
export const FAQ_GROUPS = [
  {
    id: "start",
    keys: ["what", "roles", "hiring", "link", "preview", "languages"],
  },
  {
    id: "candidates",
    keys: ["candidates", "voice", "cheating", "open-to-offers", "verified"],
  },
  {
    id: "pricing",
    keys: [
      "cost",
      "charged",
      "compare_hiring",
      "expire",
      "currency",
      "refunds",
    ],
  },
  {
    id: "results",
    keys: ["scorecards", "reports", "notes", "action_log"],
  },
  { id: "tools", keys: ["integrations", "ai_apps"] },
  {
    id: "privacy",
    keys: ["privacy", "eu_ai_law", "uk_us", "emails", "delete", "report"],
  },
] as const
