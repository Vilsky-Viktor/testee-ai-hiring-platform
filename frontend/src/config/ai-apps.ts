// The Model Context Protocol's mark, for AI apps on the integrations tab and their page.
export const MCP_MARK = "/integrations/mcp.svg"

// The best-known AI apps' own logos, found by the name an app connected with; `mono`, one drawn
// in black, which the dark theme turns white.
export const AI_APP_LOGOS = [
  { name: /claude/i, logo: "/ai-apps/claude.svg", mono: false },
  { name: /chatgpt|openai/i, logo: "/ai-apps/chatgpt.svg", mono: false },
  { name: /gemini/i, logo: "/ai-apps/gemini.svg", mono: false },
  { name: /perplexity/i, logo: "/ai-apps/perplexity.svg", mono: false },
  { name: /mistral|le chat/i, logo: "/ai-apps/mistral.svg", mono: false },
  { name: /cursor/i, logo: "/ai-apps/cursor.svg", mono: true },
  { name: /copilot/i, logo: "/ai-apps/copilot.svg", mono: true },
]

// Where AI apps reach testee's MCP server, on the site's own address.
export const MCP_PATH = "/mcp"

// The name an AI app is given for testee, in its connector settings and in Claude Code.
export const MCP_NAME = "testee"

// Claude's and ChatGPT's own menu names, as they show them (in English), shown in chips.
export const CLAUDE_CONNECTOR_PATH = [
  "Customize",
  "Connectors",
  "+ Add",
  "Add custom connector",
]
export const CHATGPT_ADD_PATH = ["Plugins", "+", "Add custom MCP server"]
export const CHATGPT_CREATE_PATH = [
  "I understand and want to continue",
  "Create as a plugin",
]
export const CHATGPT_AUTH = "OAuth"

// The developer docs' MCP tab: other AI apps and one's own agents.
export const MCP_DOCS_PATH = "/api-docs?tab=mcp"
