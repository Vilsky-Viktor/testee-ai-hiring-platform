// The features page's and the hiring flow page's pictures of the real app, in public/features/<name>-<light|dark>.webp:
// made by e2e_tests/signed-in/specs/zz-features-shots.spec.ts (SHOTS=1) and
// scripts/features-shots.sh, which crops them and gives each its size here (both themes alike),
// at twice the pixels of the screen they were taken on.
export const FEATURE_SHOTS = {
  topics: { width: 2000, height: 1360 },
  invite: { width: 1024, height: 914 },
  settings: { width: 2000, height: 1280 },
  start: { width: 2480, height: 1560 },
  question: { width: 2520, height: 1280 },
  voice: { width: 2520, height: 1280 },
  brand: { width: 1988, height: 1400 },
  candidates: { width: 2000, height: 1310 },
  signals: { width: 2520, height: 1280 },
  share: { width: 1024, height: 870 },
  notes: { width: 2000, height: 920 },
  integrations: { width: 1988, height: 1400 },
  "bias-audit": { width: 1024, height: 1088 },
  email: { width: 1160, height: 1050 },
  "flow-review": { width: 2520, height: 1608 },
  "flow-questions": { width: 2620, height: 1836 },
  "flow-settings": { width: 2000, height: 1280 },
  "flow-invite": { width: 1024, height: 914 },
  "flow-question": { width: 2520, height: 1280 },
  "flow-candidates": { width: 2000, height: 1310 },
  "flow-share": { width: 1024, height: 870 },
  "flow-report": { width: 2520, height: 2640 },
  create: { width: 1440, height: 500 },
} as const

export type FeatureShotName = keyof typeof FEATURE_SHOTS

// Where the pictures are served from.
export const FEATURE_SHOTS_PATH = "/features"
