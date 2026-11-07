import * as Sentry from "@sentry/nextjs"
import { afterEach, describe, expect, it, vi } from "vitest"

import { sentryOptions } from "@/lib/sentry"

const scrub = (event: object) =>
  sentryOptions().beforeSend(event as Sentry.ErrorEvent)

/** What the real SDK sends for a traced request, with the app's options and every trace sampled. */
async function tracedRequest(name: string, attributes: Record<string, string>) {
  const sent: unknown[] = []
  vi.stubEnv("FRONTEND_SENTRY_DSN", "https://key@o1.ingest.sentry.io/1")
  Sentry.init({
    ...sentryOptions(),
    tracesSampleRate: 1,
    transport: () => ({
      send: async (envelope: unknown) => {
        sent.push(envelope)

        return {}
      },
      flush: async () => true,
    }),
  })
  Sentry.startSpan({ name, attributes }, () => undefined)
  await Sentry.flush(2000)

  return JSON.stringify(sent)
}

afterEach(async () => {
  await Sentry.close()
})

describe("sentryOptions", () => {
  it("collects no IP address, cookies, headers, bodies or query strings", () => {
    vi.stubEnv("FRONTEND_SENTRY_DSN", "https://key@o1.ingest.sentry.io/1")
    Sentry.init(sentryOptions())

    expect(Sentry.getClient()?.getDataCollectionOptions()).toMatchObject({
      userInfo: false,
      cookies: false,
      httpHeaders: { request: false, response: false },
      httpBodies: [],
      urlQueryParams: false,
      stackFrameVariables: false,
    })
  })

  it("keeps every link's secret token and email out of an error report", () => {
    const event = {
      request: { url: "https://testee.ai/unsubscribe?token=abc.def&x=1" },
      breadcrumbs: [
        { data: { url: "/api/notifications/unsubscribe/abc.def" } },
        {
          message:
            "Opened /embedded/s3cret and /invite/t0k3n for ann@example.com",
        },
        { data: { url: "/api/companies/links/l1nk/start" } },
      ],
    }

    expect(scrub(event)).toEqual({
      request: { url: "https://testee.ai/unsubscribe?token=[token]&x=1" },
      breadcrumbs: [
        { data: { url: "/api/notifications/unsubscribe/[token]" } },
        { message: "Opened /embedded/[token] and /invite/[token] for [email]" },
        { data: { url: "/api/companies/links/[token]/start" } },
      ],
    })
  })

  it("keeps secret tokens and emails out of the traces the SDK sends", async () => {
    const sent = await tracedRequest("GET /invite/s3cret-invite", {
      // As the SDK names a span by its address; a named route has no token.
      "sentry.segment.name.source": "url",
      "url.full": "https://testee.ai/unsubscribe?token=s3cret-query",
      "http.url": "/api/companies/invites/s3cret-api",
      "user.note": "ann@example.com",
    })

    expect(sent).toContain("/invite/[token]")
    expect(sent).not.toMatch(/s3cret|ann@example\.com/)
  })
})
