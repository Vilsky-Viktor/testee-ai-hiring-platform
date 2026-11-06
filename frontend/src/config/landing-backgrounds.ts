// The landing sections' backgrounds, each drawn by a ::before under its element's content and
// as wide as the window, while the content keeps the page's width.

// The window-wide layer itself: the page's whole width, edge to edge (its element is centred in
// the page's container, app/page.tsx). Not over a scrollbar's gutter: anything there would let
// the page scroll sideways.
const LAYER =
  "relative before:pointer-events-none before:absolute before:start-[calc(50%-50cqw)] before:-z-10 before:w-[100cqw]"

// A grey band: the site's one grey, top to bottom of its element.
export const BAND = `${LAYER} before:inset-y-0 before:bg-surface`

// A faint dot grid in the borders' colour, 24 px apart, across the window, fading out only at its
// top and bottom.
export const DOT_GRID = `${LAYER} before:inset-y-0 before:bg-[radial-gradient(var(--border)_1.5px,transparent_1.5px)] before:bg-size-[24px_24px] before:mask-[linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]`

// A soft glow of the primary colour in an ellipse as large as its element, no edges, the same
// strength in both themes.
export const GLOW = `${LAYER} before:inset-y-0 before:bg-[radial-gradient(ellipse_closest-side,color-mix(in_oklch,var(--primary)_16%,transparent),transparent)] dark:before:bg-[radial-gradient(ellipse_closest-side,color-mix(in_oklch,var(--primary)_16%,transparent),transparent)]`

// The interview card among the ways in: the section's background shows through it faintly.
export const SEE_THROUGH_CARD =
  "bg-[color-mix(in_oklab,color-mix(in_oklab,var(--muted)_40%,var(--background))_75%,transparent)]"

// The features page's tabs bar: the page's own colour across the window, with a line of the
// borders' grey under it across the window, fading out only near its sides.
export const TAB_BAR = `${LAYER} before:inset-y-0 before:bg-background after:pointer-events-none after:absolute after:start-[calc(50%-50cqw)] after:bottom-0 after:h-px after:w-[100cqw] after:bg-[linear-gradient(to_right,transparent,var(--border)_5%,var(--border)_95%,transparent)]`
