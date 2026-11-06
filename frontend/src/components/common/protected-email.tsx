"use client"

import { useInBrowser } from "@/hooks/use-in-browser"
import { TEXT_LINK } from "@/config/links"

/** An email address put together only in the browser: the server's HTML doesn't hold it, so
bots that read pages without running scripts don't find it. */
export function ProtectedEmail({
  user,
  domain,
}: {
  user: string
  domain: string
}) {
  const browser = useInBrowser()

  if (!browser) {
    return null
  }

  const address = `${user}@${domain}`

  return (
    <a href={`mailto:${address}`} className={TEXT_LINK}>
      {address}
    </a>
  )
}
