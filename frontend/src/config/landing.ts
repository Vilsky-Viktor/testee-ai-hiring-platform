// The pass mark of the home page's sample test, the same as a new test's default (the companies
// service's DEFAULT_PASS_MARK).
export const DEMO_PASS_MARK = 70

// Where "watch demos" on the home page leads: testee's demo videos on YouTube.
export const DEMOS_URL = "https://www.youtube.com/@testee"
// The YouTube video the hero's "video" button plays; a stand-in until testee's own is up.
export const HERO_VIDEO_ID = "aqz-KE-bpKQ"

// How long a full interview takes from a job description to ready, rounded up for a safe promise
// (a 7-topic, hard template took about 7 minutes on 2026-10-17); shown under the home page's box.
export const READY_MINUTES = 10

// The hero's wires, four coming to the job description box's top edge, each from a floating hollow
// circle, far apart there and close together on the pill on that edge (start-test.tsx). Where each
// starts (`from`, `fromY`) and ends (`to`), in percent of the box's width and of the space above
// the box, two bends it leans toward (x, y in those percents), and how long its circle takes to
// sway, in seconds, so no two float together. Fixed, so every visit draws the same curves.
export const HERO_WIRES = [
  {
    from: -35,
    fromY: 42,
    bends: [
      [-12, 42],
      [35, 68],
    ],
    to: 42,
    delay: 1.3,
    sway: 7,
  },
  {
    from: 16,
    fromY: 27,
    bends: [
      [32, 54],
      [48, 72],
    ],
    to: 47,
    delay: 0.5,
    sway: 6,
  },
  {
    from: 58,
    fromY: 38,
    bends: [
      [57, 58],
      [58, 72],
    ],
    to: 53,
    delay: 1.9,
    sway: 8,
  },
  {
    from: 99,
    fromY: 53,
    bends: [
      [97, 55],
      [72, 62],
    ],
    to: 58,
    delay: 0.9,
    sway: 6.5,
  },
] as const

// The net under the wires' starts, in pixels: a square's size and a person's size in one; and how
// many squares it reaches from a start before it's faded out, and how much of that still shows.
export const HERO_NET = { cell: 32, icon: 16, reach: 4, visible: 0.85 }

// One more net, in the hero's empty place above the title: as fractions of the window's width and
// the hero's height. It isn't shown on a screen where it would reach the content.
export const HERO_NET_SPOTS = [[0.12, 0.22]]

// How far the wires reach under the job description box, in pixels, so no gap opens as it jumps.
export const WIRE_UNDER = 24

// How fast a spark runs along its wire, in pixels a second, the same on every screen; and how
// fast it pulses, in seconds.
export const SPARK_SPEED = 170
export const PULSE_SECONDS = 0.6

// The one straight wire on from the box: its candidates this many times the others' size, running
// at this speed in pixels a second (slower than theirs).
export const OUT_SIZE = 1.5
export const OUT_SPEED = 120

// How much thicker that wire is than the others.
export const OUT_THICKNESS = 2

// How much of the window a demo's frame leaves free, in pixels: the header and the title sitting
// on the frame's top edge.
export const DEMO_ROOM_PX = 112
