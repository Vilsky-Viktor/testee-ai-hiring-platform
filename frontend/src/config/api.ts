// The public API's reference on the site.
export const API_DOCS_PATH = "/api-docs"
// The longest key name and web hook address the API takes.
export const MAX_KEY_NAME = 80
export const MAX_WEBHOOK_URL = 500
// Public pages' data, the same for every visitor (prices, FAQ, legal texts, role tests): how
// long the site keeps a copy, in seconds, and how long it waits for a service, in milliseconds.
export const PUBLIC_REVALIDATE_SECONDS = 300
export const PUBLIC_TIMEOUT_MS = 5000
// A signed-in page's calls give up after this long, so a service that hangs fails the page (or
// leaves out what it adds) in seconds rather than holding it for a minute.
export const SERVER_TIMEOUT_MS = 10000
// An interview's calls in the browser give up after this long, so a stalled connection brings
// back the candidate's controls with an error rather than freezing the screen for minutes.
export const SESSION_TIMEOUT_MS = 15000

// What a web hook gets, shortened, shown before the first one is added.
export const WEBHOOK_SAMPLE = `{
  "id": "6f1c…",
  "type": "candidate.finished",
  "occurred_at": "2026-11-05T10:14:00+00:00",
  "data": { "interview": { … }, "candidate": { … } }
}`

// The developer docs' SDK tab.
export const SDK_DOCS_PATH = `${API_DOCS_PATH}?tab=sdk`

/** The shortest embed, from the SDK tab of the developer docs (api's constants/docs_sdk.py), which
 * has every option: `origin` is the site serving the script. */
export function embedSnippet(origin: string) {
  return `<div id="interview"></div>
<script>
  window.Testee = window.Testee || { q: [], embed: function (o) { this.q.push(o) } }
  // The candidate's invite_url, which your server got when it invited them.
  const candidateInviteUrl = "${origin}/invite/3fTq9xLk2VbN7wZr8YcP1mHd5sJ4gAe6uQo0RiKtEy"
  Testee.embed({ element: "#interview", url: candidateInviteUrl })
</script>
<script async src="${origin}/embed/v1.js"></script>`
}
