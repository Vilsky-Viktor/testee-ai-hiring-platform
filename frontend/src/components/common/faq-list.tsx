import { ChevronDownIcon } from "lucide-react"
import ReactMarkdown from "react-markdown"

import { SiteLink } from "@/components/common/markdown"
import { LIST_BOX, ROW_HOVER, ROW_ICON } from "@/config/lists"
import { FAQ_MARKDOWN } from "@/lib/markdown"

import type { FaqItem } from "@/types/help"

/** Questions that open to their answers, as the site's rows; an answer's links to the site's
 * pages are links. */
export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className={`${LIST_BOX} overflow-hidden`}>
      {items.map((item) => (
        <details key={item.key} className="group/details">
          <summary
            className={`group/row flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-lg font-medium ${ROW_HOVER} [&::-webkit-details-marker]:hidden`}
          >
            {item.question}
            <span aria-hidden className={`${ROW_ICON} size-8`}>
              <ChevronDownIcon className="size-4 transition-transform group-open/details:rotate-180" />
            </span>
          </summary>
          <div className="max-w-3xl px-6 pt-1 pb-5 text-base leading-relaxed text-muted-foreground">
            <ReactMarkdown {...FAQ_MARKDOWN} components={{ a: SiteLink }}>
              {item.answer}
            </ReactMarkdown>
          </div>
        </details>
      ))}
    </div>
  )
}
