/** A heading's address on its page, in any language: "Fairness and the law" ->
 * "fairness-and-the-law". */
export function headingId(title: string) {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "")
}

/** The titles of an article's sections ("## "), its links and bold taken out. */
export function sectionTitles(markdown: string) {
  return [...markdown.matchAll(/^## (.+)$/gm)].map(([, title]) =>
    title.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*`]/g, "")
  )
}
