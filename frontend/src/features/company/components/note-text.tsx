"use client"

import { useTranslations } from "next-intl"
import { useLayoutEffect, useRef, useState } from "react"

import { TEXT_LINK } from "@/config/links"
import { linkParts } from "@/lib/linkify"

/** A note's text with its addresses as links; a long one cut after a few lines, with the way to
 * read it all. */
export function NoteText({ text }: { text: string }) {
  const t = useTranslations("interviews")
  const box = useRef<HTMLParagraphElement>(null)
  const [cut, setCut] = useState(false)
  const [whole, setWhole] = useState(false)

  useLayoutEffect(() => {
    const shown = box.current

    if (shown && !whole) {
      setCut(shown.scrollHeight > shown.clientHeight)
    }
  }, [text, whole])

  return (
    <div className="space-y-1 max-sm:-ms-14">
      <p
        ref={box}
        dir="auto"
        className={`text-base break-words whitespace-pre-wrap ${whole ? "" : "line-clamp-5"}`}
        data-testid="note-text"
      >
        {linkParts(text).map((part, index) =>
          part.url ? (
            <a
              key={index}
              href={part.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              dir="ltr"
              className={`${TEXT_LINK} break-all`}
            >
              {part.text}
            </a>
          ) : (
            part.text
          )
        )}
      </p>
      {(cut || whole) && (
        <button
          type="button"
          data-testid="note-more"
          className={`${TEXT_LINK} cursor-pointer text-sm`}
          onClick={() => setWhole(!whole)}
        >
          {t(whole ? "noteShowLess" : "noteShowMore")}
        </button>
      )}
    </div>
  )
}
