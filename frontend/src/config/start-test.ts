// The home page's start (components/common/start-test.tsx, app/generate/company and
// app/generate/new).
// The job description sent from the home page, kept in the tab while its company is chosen
// (app/generate/company) and its interview made, and back in the box if the user goes back.
export const DRAFT_KEY = "testee:draft"
// The job description an interview is being made from, by its generation's id, kept in the tab for
// the generating page: the API doesn't send it.
export const MADE_FROM_KEY = "testee:made-from"
// An interview to make is kept in the tab under this key until the generating page has made it,
// so a reload there carries on with it (lib/pending-start.ts).
export const PENDING_START_KEY = "testee:start"
// The services' code for the same create still running: asked again this often, this long.
export const REQUEST_IN_PROGRESS = "request_in_progress"
export const START_RETRY_MS = 1500
export const START_WAIT_MS = 60_000
