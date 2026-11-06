/** How far below `anchor` (something in the site's header that opens a panel) the header's bottom
 * line is, for the panel to hang from it, its top edge on the line; `fallback` when the anchor
 * isn't in the header (the phones' search bar under it) or not there yet. */
export function belowHeader(
  anchor: Element | null | undefined,
  fallback: number
) {
  const header = anchor?.closest("header")

  if (!anchor || !header) {
    return fallback
  }

  // Up by the line's own width, so the panel's top edge lies on it: one line, not two.
  const line = parseFloat(getComputedStyle(header).borderBottomWidth) || 0

  return (
    header.getBoundingClientRect().bottom -
    line -
    anchor.getBoundingClientRect().bottom
  )
}
