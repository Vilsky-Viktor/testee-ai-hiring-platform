// The home page's "trust, quality and compliance" section: the quality loop's steps and the
// cards under it. Display only.
import {
  FlagIcon,
  ListChecksIcon,
  PenLineIcon,
  ScanSearchIcon,
  SparklesIcon,
} from "lucide-react"

// The loop's steps, in order, by their text's key; after the last, back to the first.
export const QUALITY_STEPS = [
  "generated",
  "checked",
  "answered",
  "flagged",
  "rewritten",
] as const

export type QualityStep = (typeof QUALITY_STEPS)[number]

// Each step's icon.
export const QUALITY_ICONS = {
  generated: SparklesIcon,
  checked: ScanSearchIcon,
  answered: ListChecksIcon,
  flagged: FlagIcon,
  rewritten: PenLineIcon,
}

// Light through the loop's net: each ring's seconds from the chip to the ellipse, and how many
// rings run at once, evenly apart.
export const NET_WAVE_SECONDS = 8
export const NET_WAVES = 2

// The ellipse the steps sit on, centred on the stage: its radii, in percent of the stage's width
// and height. The steps sit evenly round it, the first at the top, then clockwise, so left and
// right mirror each other.
export const QUALITY_ELLIPSE = { x: 36, y: 34 }

// A step card's padding and border from laptops up, top and bottom together, in pixels (pt-9
// under the icon on its edge, pb-5, border).
export const QUALITY_CARD_PADDING = 58

// The net's mesh, in pixels.
export const NET_CELL = 22

// How long the question rests on a step before it moves on, in milliseconds.
export const QUALITY_PAUSE_MS = 700

// How fast the question runs along a wire, in pixels a second.
export const QUALITY_SPEED = 150

// As the loop comes into view: the chip pops in, then the steps one after another, this many
// milliseconds apart, from this long after it; the question sets off once the last has landed.
export const QUALITY_POP_AFTER_MS = 150
export const QUALITY_POP_STAGGER_MS = 90
export const QUALITY_START_MS = 900

// The columns under the loop pop in one after another as they come into view, this many
// milliseconds apart.
export const TRUST_POP_STAGGER_MS = 120

// The cards under the loop, by their text's key.
export const TRUST_CARDS = ["person", "fair", "laws", "log"] as const

export type TrustCard = (typeof TRUST_CARDS)[number]
