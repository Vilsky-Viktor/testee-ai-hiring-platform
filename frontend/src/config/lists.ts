// Items a list asks the API for at a time; the next page loads as the user nears the end.
export const PAGE_SIZE = 20

// Start loading the next page when this many items are left below the viewport.
export const LOAD_AHEAD = 5

// Rows rendered beyond the viewport, so fast scrolling doesn't show blanks.
export const OVERSCAN = 6

// The viewport assumed before the browser can measure (server rendering), so the first rows
// render on the server instead of appearing only once the page's JavaScript runs: tall enough
// that, with OVERSCAN, a whole page of PAGE_SIZE rows is in the HTML for search engines.
export const INITIAL_VIEWPORT = { width: 1024, height: 1200 }

// A page's list: its rows in one bordered, rounded box. On phones it spans the screen, out of
// the page's side padding, with only its top and bottom borders and square corners.
export const LIST_BOX =
  "-mx-6 divide-y border-y sm:mx-0 sm:rounded-xl sm:border" +
  // Under a search (SearchedList): no top border or top corners, so the two read as one block.
  " searched:border-t-0! searched:rounded-t-none!"

// A list's empty state; under a search it closes the block the search starts, in the list's box.
export const LIST_EMPTY =
  "py-16 text-center text-muted-foreground searched:max-sm:-mx-6 searched:max-sm:border-b searched:sm:rounded-b-xl searched:sm:border searched:sm:border-t-0"

// A search's field over a list (SearchedList): the list's border on its top and sides (the seam is
// its bottom one; focus still turns it the focus colour), square bottom corners, and on phones
// square and across the screen like the list, with no side borders.
export const SEARCH_OVER_LIST =
  "searched:border-border searched:rounded-b-none! searched:max-sm:rounded-none! searched:max-sm:border-x-0"

// From this number up, numbers show short ("1K"), the whole number in a tooltip.
export const SHORT_NUMBER_FROM = 1000

// From this many companies the companies page offers a search.
export const COMPANIES_SEARCH_FROM = 6

// A list's or table's row reacting to hover (and to a tap on touch screens): the search field's
// grey.
// A row's icon, a step darker as the row (group/row) is hovered, so it stays apart from its grey.
export const ROW_ICON =
  "flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface text-muted-foreground group-hover/row:bg-input"
export const ROW_HOVER =
  "row-hover transition-colors hover:bg-surface active:bg-surface"

/** An integration's row on the integrations tab: its logo tile, name and text, then its buttons.
 * On phones a small logo sits beside the name and the buttons take a full line under them. */
export const INTEGRATION_ROW = `relative flex items-center justify-between gap-6 py-6 pe-4 ${ROW_HOVER} max-sm:grid max-sm:grid-cols-[3rem_minmax(0,1fr)_auto] max-sm:items-center max-sm:gap-x-4 max-sm:gap-y-4 max-sm:px-4 sm:pe-6`

/** The row's link: it covers the whole row; on phones its logo and text join the row's grid. */
export const INTEGRATION_LINK =
  "flex min-w-0 items-center gap-4 self-stretch after:absolute after:inset-0 max-sm:contents"

/** The logo tile: full height of the row; on phones a small rounded tile beside the name. */
export const INTEGRATION_LOGO =
  "-my-6 me-2 flex min-h-[6.25rem] w-[6.25rem] shrink-0 items-center justify-center self-stretch overflow-hidden bg-(--surface-solid) max-sm:m-0 max-sm:size-12 max-sm:min-h-0 max-sm:self-start max-sm:rounded-lg"

/** An integration's group of buttons, on its row and on its page. */
export const INTEGRATION_ACTIONS = "flex shrink-0 items-center gap-3"
// A search as you type asks the service once typing pauses this long.
export const SEARCH_DELAY_MS = 500
// The public template catalog, the same for every visitor: its pages read it cached.
export const PUBLIC_TEMPLATES_PATH = "/library/templates"
// That catalog as a public hub's default list: indexable templates only, by title.
export const PUBLIC_TEMPLATES_HUB_PATH = "/library/templates/hub"

// How long a field that saves itself shows its check, in milliseconds.
export const SAVED_MARK_MS = 2500

// The recent periods a download offers, in days.
export const DOWNLOAD_PERIOD_DAYS = [30, 90]
