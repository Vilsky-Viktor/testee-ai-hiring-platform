# The API reference's API tab: getting a key, signing in, errors, lists and the changelog.
API_TAB = """# API

Use the testee API to connect interviews to your own platform. You can create interviews from job
descriptions, invite and manage candidates, read results, find a candidate by email, read and add
your team's notes, and check your credits. To hear about results as they happen, add a
[web hook](/api-docs?tab=webhooks).

## Get an API key

1. Sign in to testee as an owner or admin of your company.
2. Open your company from your workspace and go to **Integrations**, then **API**.
3. Select **New key**.
4. Name the key after the platform that will use it, choose its permissions and when it expires
   (in 1, 3, 6 or 12 months, or never), then confirm.
5. Copy the key and store it securely. It's shown only once, because testee keeps only a hash of
   it.

A company can have up to 10 keys. An expired key returns `401`, and deleting a key revokes it
immediately.

To rotate a key without downtime, make a new one while the old one still works, switch your
platform to it, check the key's page shows it being used, then delete the old one.

## Authenticate

Send your key with every request, in the `Authorization` header:

```bash
Authorization: Bearer te_...
```

A key belongs to one company and acts as itself, not as the member who made it. Invitations are
sent under the key's own email limits, and it keeps working after that member leaves. It stops
only when it expires or is deleted.

## Limit a key to your servers

On a key's page, you can list the addresses your servers call from: IPv4 or IPv6 addresses, or
CIDR ranges such as `203.0.113.7` or `2001:db8::/32`. A request from any other address returns
`403` (`ip_not_allowed`). A key with no list works from any address.

testee checks the address your request reached it from, so an `X-Forwarded-For` header you send
yourself is ignored.

## Quickstart: invite a candidate

This request invites a candidate and returns their invite link. It's safe to send twice: nobody
is invited a second time.

```bash
curl -X POST "https://testee.ai/api/v1/interviews/$INTERVIEW_ID/candidates" \\
  -H "Authorization: Bearer $TESTEE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "ada@example.com", "name": "Ada Lovelace"}'
```

```python
import os

import httpx

interview_id = "YOUR_INTERVIEW_ID"
api_key = os.environ["TESTEE_API_KEY"]

response = httpx.post(
    f"https://testee.ai/api/v1/interviews/{interview_id}/candidates",
    headers={"Authorization": f"Bearer {api_key}"},
    json={"email": "ada@example.com", "name": "Ada Lovelace"},
)
response.raise_for_status()
print(response.json()["invite_url"])
```

```typescript
const interviewId = "YOUR_INTERVIEW_ID"
const response = await fetch(
  `https://testee.ai/api/v1/interviews/${interviewId}/candidates`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.TESTEE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: "ada@example.com", name: "Ada Lovelace" }),
  },
)

if (!response.ok) {
  throw new Error((await response.json()).detail)
}

const candidate = await response.json()
console.log(candidate.invite_url)
```

## Rate limits

All of a company's keys share a limit of requests per minute. Past it, requests return `429` with
a `Retry-After` header giving the seconds to wait.

## Pagination

Lists return the newest items first and accept `offset` and `limit`, up to 100 items a request.
A full page comes with a `Link` header pointing to the next one:

```bash
Link: <https://testee.ai/api/v1/...>; rel="next"
```

Follow it until a response has none. The page after a full one can be empty.

## Sync changes

Interviews and candidates carry `updated_at`, the time they last changed. To fetch only what
changed, pass `updated_since` to a list. It returns items changed at that time or later, oldest
change first.

For the next page, pass the last item's `updated_at` as `updated_since` and its `id` as `after`,
so items changed at the same moment are neither repeated nor missed. The `Link` header's next
page does this for you. Keep the last pair and start from it next time.

A candidate's progress while they answer doesn't change `updated_at`. A removed candidate leaves
the list, and the `candidate.removed` web hook event tells you so.

## Retry safely

You can retry any request as it is, with nothing extra to send:

- Inviting an address that's already invited, or has finished, returns that candidate as they are,
  with `200` instead of `201`. No email is sent and no credits are used. An expired invite is sent
  again.
- Creating an interview with the same request from the same key within 15 minutes returns the
  interview the first request made, with `200`. `201` only ever means something new was made.
- A retry while the first request is still running returns `409` (`request_in_progress`). Wait a
  moment and try again.

## Invite links

Until a candidate finishes, they come with `invite_url`, the same link their invite email
carries. Send it to them yourself if the email didn't reach them. Only the invited email can use
it, unless they were invited with `sign_in` false. It's null once they've finished or the invite
has expired.

## Send candidates from your platform

If your platform already knows who the candidate is, invite them with `sign_in` false. testee then
sends no emails, and `invite_url` opens the interview without signing in. Anyone with that link
can take the interview, so give it only to the candidate.

Add a `return_url` to bring them back when they finish. It can be any https address, or http on
`localhost` or `127.0.0.1` while you test; anything else returns `422` (`return_url_invalid`). You
can also [embed the interview](/api-docs?tab=sdk) in your own page.

The API and web hooks don't depend on any domain: limit a key to your servers with its allowed
IPs instead. Your company's allowed domains only decide which sites may embed the interview with
the SDK. Company verification only adds the verified badge: the API, the SDK and MCP all work
without it.

## Results support a person's decision

A candidate's `grade`, `passed` and `signals` help a person decide, but they aren't a decision.
Don't reject candidates automatically on them. Before rejecting anyone, a person should open the
candidate's full results at `results_url` and review them.

## Errors

A failed request returns a standard HTTP status and a JSON body with a `code` and a `detail`:

```json
{"detail": "Interview not found", "code": "not_found"}
```

Branch on `code`, which never changes. `detail` explains it for people, in the language of your
`Accept-Language` header. For an invalid request (`validation_failed`), `detail` is a list with
one entry per bad field, named by its `loc`.

Each endpoint lists the errors it can return. New codes can be added, so handle any you don't know
by its HTTP status.

| Code | Status | Meaning |
|---|---|---|
| `invalid_api_key` | 401 | The key is missing or not a key |
| `api_key_expired` | 401 | The key has expired |
| `ip_not_allowed` | 403 | The key doesn't allow the address the request came from |
| `missing_permission` | 403 | The key lacks the endpoint's permission |
| `not_found` | 404 | No such interview or candidate in your company |
| `insufficient_credits` | 402 | Not enough credits to invite |
| `interview_not_ready` | 409 | The interview's questions are still being made |
| `candidate_finished` | 409 | The candidate already finished |
| `candidate_started` | 409 | Extra time only before the candidate starts |
| `invited_without_sign_in` | 409 | testee doesn't email a candidate invited with `sign_in` false |
| `company_suspended` | 409 | The company is suspended; its notes can be read, not added |
| `interview_quota_reached` | 409 | As many interviews without candidates as allowed |
| `request_in_progress` | 409 | The same request is still running |
| `idempotency_key_reused` | 422 | An `Idempotency-Key` sent before with another request |
| `return_url_invalid` | 422 | `return_url` isn't https (http only on localhost) |
| `validation_failed` | 422 | The request is invalid; `detail` names each field |
| `body_too_large` | 413 | The request body is too large |
| `rate_limited` | 429 | A rate or email limit; wait `Retry-After` seconds |
| `paused` | 503 | What the endpoint does is paused for a while |
| `ai_budget_used_up` | 503 | Today's AI budget is used up; `Retry-After` says until when |
| `maintenance` | 503 | testee is down for maintenance |

Any other refusal carries its status's code: `bad_request`, `unauthorized`, `forbidden`,
`method_not_allowed`, `conflict` or `unavailable`.

## Changelog

Within `v1`, fields, optional parameters, error codes, enum values and event types are only ever
added. Anything retired first answers with `Deprecation` and `Sunset` headers and is listed here.

- 2026-11-04: voice mode works in every language, so `voice_unavailable` is no longer returned.
- 2026-10-30: inviting a candidate takes an optional `mode` (`click` or `voice`), refused with
  `voice_unavailable` in a language voice mode doesn't support; candidates carry their `mode`.
- 2026-10-29: `GET /interviews/{id}/notes` and `POST /interviews/{id}/notes` list and add your
  team's notes on an interview, with the new `notes:read` and `notes:add` permissions.
- 2026-10-29: a key can be limited to allowed IPs (`ip_not_allowed`); `return_url` may be any
  https address (http on localhost), refused otherwise with `return_url_invalid`, which replaces
  `return_url_off_domain`; embedding follows the company's allowed domains instead of its
  verified website domain.
- 2026-10-22: every error carries a machine-readable `code` beside its `detail` (see Errors).
- 2026-10-22: a full page of a list sends a `Link` header to the next one; candidates carry
  their `interview_id`.
- 2026-10-22: a retried request that made nothing new answers `200`, not `201`.
- 2026-10-22: `POST /candidates/search` finds candidates by an email in the body.
  `GET /candidates?email=` is deprecated, as it puts an email in the URL: it keeps working until
  1 May 2027 and answers with `Deprecation`, `Sunset` and `Link` (`rel="deprecation"`) headers.
- 2026-10-22: web hook bodies carry `timestamp`, the same as `occurred_at`.
- 2026-10-22: a web hook's secret can be rolled; for 24 hours both secrets sign, so
  `Testee-Signature` carries a `v1=` for each.

"""
