// The developer docs' tabs, in order: the API, its web hooks and the SDK (each with its part of
// the API's description, lib/openapi.ts descriptionTabs), the MCP server (config/mcp-docs.ts)
// and the objects they return. The first is the page's own address.
export const DOC_TABS = ["api", "webhooks", "sdk", "mcp", "objects"] as const

export type DocTab = (typeof DOC_TABS)[number]

// The API tab's pages, each at ?tab=api&page=<id>, with the sections of the API's description each
// shows (null: the text before its first title). The first is the tab's own address.
export const API_PAGES = [
  {
    id: "start",
    sections: [
      null,
      "Get an API key",
      "Authenticate",
      "Limit a key to your servers",
      "Quickstart: invite a candidate",
    ],
  },
  {
    id: "guides",
    sections: [
      "Rate limits",
      "Pagination",
      "Sync changes",
      "Retry safely",
      "Invite links",
      "Send candidates from your platform",
      "Results support a person's decision",
    ],
  },
  { id: "endpoints", sections: [] },
  { id: "errors", sections: ["Errors"] },
  { id: "changelog", sections: ["Changelog"] },
] as const
