"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { LocalizedLink } from "@/components/common/localized-link"
import { Button } from "@/components/ui/button"
import { goToStart, startBox } from "@/lib/start-box"

const BUTTON = "h-10 shrink-0 px-5 max-lg:hidden"

/** A visitor's main action, where there's room for it beside the search: on any page, the way to
 * the home page; on the home page, once its job description box has scrolled away, back up to it.
 */
export function HeaderCreate({ home }: { home: boolean }) {
  const nav = useTranslations("nav")
  const [passed, setPassed] = useState(false)

  useEffect(() => {
    function update() {
      const box = startBox()?.getBoundingClientRect()
      setPassed(box !== undefined && box.bottom < 0)
    }

    update()
    window.addEventListener("scroll", update, { passive: true })

    return () => window.removeEventListener("scroll", update)
  }, [])

  if (!home) {
    return (
      <Button
        className={BUTTON}
        data-testid="header-create"
        render={<LocalizedLink href="/" />}
        nativeButton={false}
      >
        {nav("createTest")}
      </Button>
    )
  }

  return (
    passed && (
      <Button
        className={BUTTON}
        data-testid="header-create"
        onClick={goToStart}
      >
        {nav("createTest")}
      </Button>
    )
  )
}
