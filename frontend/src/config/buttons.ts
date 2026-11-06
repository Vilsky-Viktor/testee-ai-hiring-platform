// A rounded icon button that clearly reacts on hover: muted, brightening on a full grey square. The
// ghost button's own dark hover (muted at half) barely shows on the page's, cards' and panels'
// greys.
export const ROUND_ICON_BUTTON =
  "rounded-xl text-muted-foreground hover:bg-surface hover:text-foreground"

// The primary button's fill (components/ui/button.tsx), for anything filled with the primary
// colour: lighter at the top, a light line along its top edge.
export const PRIMARY_FILL =
  "bg-primary bg-[linear-gradient(to_bottom,color-mix(in_oklch,var(--primary)_88%,white),var(--primary))] text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.25)]"

// The "⋮" button of a row's menu (group/row on the row): grey, a step darker as the row is
// hovered, so it stays apart from the row's own grey; a small step, or it glares.
export const ROW_MENU_BUTTON =
  "size-10 shrink-0 bg-surface text-muted-foreground group-hover/row:bg-input/40 hover:bg-input hover:text-foreground"
