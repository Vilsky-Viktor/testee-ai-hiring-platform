import path from "node:path"

// The English content pages, as Markdown with frontmatter: the comparisons (compare/) and the
// guides (guides/). Each folder is served under its address.
export const CONTENT_ROOT = path.join(process.cwd(), "content")

export type ContentFolder = "compare" | "guides"
