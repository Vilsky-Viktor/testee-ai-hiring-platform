# The API reference's SDK tab: embedding the interview in a page.
SDK_TAB = """# SDK

Show the interview inside your own page instead of sending candidates to testee. It works for
candidates invited with `sign_in` false.

## Embed the interview

Your server invites the candidate and passes their `invite_url` to your page, which embeds it with
testee's script. Never put your API key in a page.

The page must be on one of your company's [allowed domains](#allowed-domains) and served over
HTTPS. Anywhere else, the interview isn't shown.

```html
<div id="interview"></div>
<script>
  // Calls made before the script has loaded wait for it.
  window.Testee = window.Testee || { q: [], embed: function (o) { this.q.push(o) } }
  // The candidate's invite_url, which your server got when it invited them.
  const candidateInviteUrl = "https://testee.ai/invite/3fTq9xLk2VbN7wZr8YcP1mHd5sJ4gAe6uQo0RiKtEy"
  Testee.embed({
    element: "#interview",
    url: candidateInviteUrl,
    theme: "dark",
    title: "Interview",
    onReady: () => {},
    onStart: () => {},
    onFinish: ({ candidateId }) => {},
    onError: ({ code }) => {},
  })
</script>
<script async src="https://testee.ai/embed/v1.js"></script>
```

Loaded without `async`, the script is ready at once and `Testee.embed(...)` returns
`{ destroy() }`, which removes the frame.

While the interview runs, the candidate should stay on it. Leaving it, even for the rest of your
page, is recorded as a page leave.

## Options

The frame fits its height to the interview.

- `element`: where the interview goes, as a CSS selector or an element. If it isn't on the page,
  `Testee.embed` throws an error.
- `url`: the candidate's `invite_url`.
- `theme`: optional. `"light"` or `"dark"` always shows that theme, in your company's colors for
  it, set on the company's **Brand** page. `"default"`, or nothing, uses the candidate's own theme,
  or the one the invite asked for.
- `title`: names the frame for screen readers.

## Callbacks

- `onReady`: the frame has loaded.
- `onStart`: the candidate has started.
- `onFinish`: gets the candidate's `id` as `candidateId`, so your page can take them on. Their
  results arrive with the `candidate.finished` web hook as usual.
- `onError`: gets a `code`. `"timeout"` means the frame didn't load within 20 seconds, because the
  page isn't on an allowed domain or the network failed. `"invite_unavailable"` means the link
  expired or was revoked. `"load_failed"` means it couldn't be read, so try again.

## Content Security Policy

If your site sends one, allow `script-src https://testee.ai` and `frame-src https://testee.ai`.

Don't add an `integrity` attribute: `v1.js` gets fixes in place, cached for 5 minutes, so a pinned
hash would stop it loading. It's served over HTTPS and may be loaded with
`crossorigin="anonymous"`.

## Allowed domains

Owners and admins list up to 20 sites that may embed your interviews on the API page's **SDK** tab:

- `jobs.acme.com` allows that site.
- `*.acme.com` allows every subdomain of `acme.com`. Add `acme.com` too for the domain itself.

To try it on your own computer, allow localhost on the same tab, or add `localhost` (any port) or
`localhost:3000` to the list. localhost is refused until you do.

These domains are only for embedding. The API and web hooks don't use them, and a `return_url` may
be any https address.

## Changes to v1

Within `v1`, options, callbacks and `onError` codes are only ever added. A change that isn't
compatible would come as `v2.js`, with `v1.js` kept working.

- 2026-10-29: the page must be on one of the company's allowed domains (localhost when allowed),
  instead of its verified website domain.
- 2026-10-20: `onError`, `title`, calls queued before the script loads, and a console warning for
  an option it doesn't know.
"""
