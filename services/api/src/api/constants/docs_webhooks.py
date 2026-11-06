# The API reference's web hooks tab: what's sent, how it's signed and retried.
WEBHOOKS_TAB = """# Web hooks

Web hooks tell your server when something happens, so you don't have to keep asking. Owners and
admins add them on the company's **API** page. Each endpoint must use HTTPS and be reachable from
the public internet.

Every endpoint gets every event below as a `POST` request: a candidate started, finished with
their results, wasn't reached by the invitation email, expired or was removed, and an interview is
ready. Ignore the types you don't need.

A candidate's results never change after they finish: a corrected question applies only to
candidates who start after the fix.

## Test an endpoint

On a web hook's page, **Send test event** sends a signed `test` event at once. The **Delivery log**
shows the latest 20 sends: each event's type, when it was sent, and whether it was delivered, what
the endpoint answered, or what went wrong.

## Verify the signature

Every request carries a `Testee-Signature` header in the form `t=<timestamp>,v1=<signature>`. The
signature is the hex-encoded HMAC-SHA256 of `<timestamp>.<raw request body>`, made with the web
hook's signing secret, which is shown once when you add it.

Before processing an event, verify the signature and reject requests whose timestamp is more than
a few minutes old. Use the raw request body, as received, before any JSON parsing.

```python
import hashlib
import hmac
import time


def verify(secret: str, header: str, body: bytes, tolerance: int = 300) -> bool:
    # Whether a request came from testee: its Testee-Signature header and raw body.
    parts = [part.split("=", 1) for part in header.split(",")]
    timestamp = int(next(value for name, value in parts if name == "t"))
    expected = hmac.new(
        secret.encode(), f"{timestamp}.".encode() + body, hashlib.sha256
    ).hexdigest()
    # While a rolled secret overlaps, there's a v1 for each secret.
    signed = any(
        hmac.compare_digest(expected, value) for name, value in parts if name == "v1"
    )

    return abs(time.time() - timestamp) <= tolerance and signed
```

```typescript
import { createHmac, timingSafeEqual } from "node:crypto"

/** Whether a request came from testee: its Testee-Signature header and raw body. */
export function verify(
  secret: string,
  header: string,
  body: string,
  tolerance = 300,
): boolean {
  const parts = header.split(",").map((part) => part.split("=", 2))
  const timestamp = Number(parts.find(([name]) => name === "t")?.[1])
  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex")
  const fresh = Math.abs(Date.now() / 1000 - timestamp) <= tolerance
  // While a rolled secret overlaps, there's a v1 for each secret.
  const signed = parts.some(
    ([name, value]) =>
      name === "v1" &&
      value.length === expected.length &&
      timingSafeEqual(Buffer.from(expected), Buffer.from(value)),
  )

  return fresh && signed
}
```

## Change the secret

Choose **Roll secret** on a web hook's page. The new secret is shown once, and for the next 24
hours requests are signed with both secrets, so the header carries two `v1=` values, the new
secret's first. Accept a request when any `v1` matches a secret you hold, then switch your
endpoint to the new secret. The old one stops signing when the 24 hours end.

## Respond and retry

Respond with any `2xx` status within 10 seconds to confirm delivery. Other responses and timeouts
are retried with growing, slightly random pauses, from 5 minutes up to 6 hours apart, for 3 days.

After that the web hook is paused: it gets no events, and the API page shows it as paused, until a
test event sent from there goes through.

An event can occasionally arrive more than once, so use its `id` to ignore duplicates.

## Event format

Each request body is a JSON object with:

- `id`: the event's id.
- `type`: what happened.
- `occurred_at`: when it happened, in ISO 8601.
- `timestamp`: the same time, under the name many web hook tools read.
- `data`: the event's details.

A retried event can arrive after a later one, so order a candidate's events by `occurred_at`, not
by when they arrive.

"""
