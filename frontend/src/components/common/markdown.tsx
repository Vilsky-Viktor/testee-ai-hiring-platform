import { cn } from "cn"
import type { ComponentProps, ReactNode } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

import { LocalizedLink } from "@/components/common/localized-link"
import { HighlightedCode } from "@/components/common/highlighted-code"
import { markdownCode } from "@/components/common/markdown-code"
import { TEXT_LINK } from "@/config/links"
import { LIST_BOX } from "@/config/lists"
import { headingId } from "@/lib/headings"
import { endsWithQuestionMark } from "@/lib/question-mark"

/** A link in the site's text: the site's own pages open in place, in the address's language;
 * others in a new tab; styled as an in-text link (config/links.ts). */
export function SiteLink({
  href = "",
  children,
}: {
  href?: string
  children?: ReactNode
}) {
  return href.startsWith("/") ? (
    <LocalizedLink href={href} className={TEXT_LINK}>
      {children}
    </LocalizedLink>
  ) : (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={TEXT_LINK}
    >
      {children}
    </a>
  )
}

// An article's list as the site's rows.
const ROWS =
  "text-base leading-relaxed text-muted-foreground [&>li]:p-4 [&>li]:transition-colors [&>li]:hover:bg-surface sm:[&>li]:px-6"

// The site's text styles for each Markdown element, as on the legal pages. Headings keep their
// capitals (names such as TestGorilla or EU), unlike the site's lowercase headings.
const ELEMENTS: ComponentProps<typeof ReactMarkdown>["components"] = {
  // A question gets no dot after its question mark (globals.css).
  h2: ({ children }) => (
    <h2
      className={cn(
        "pt-4 font-heading text-2xl font-medium normal-case",
        endsWithQuestionMark(String(children)) && "no-dot"
      )}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-medium normal-case">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-base leading-relaxed text-muted-foreground">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc space-y-2 ps-5 text-base leading-relaxed text-muted-foreground">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal space-y-2 ps-5 text-base leading-relaxed text-muted-foreground">
      {children}
    </ol>
  ),
  strong: ({ children }) => (
    <strong className="font-medium text-foreground">{children}</strong>
  ),
  a: SiteLink,
  // Colored on the server, so an article doesn't load shiki.
  pre: ({ children }) => {
    const block = markdownCode(children)

    return block ? (
      <HighlightedCode {...block} className="my-2" />
    ) : (
      <pre>{children}</pre>
    )
  },
  table: ({ children }) => (
    <div className="overflow-x-auto rounded-xl border">
      {/* A body row lights up on hover in the search field's grey, as ROW_HOVER (config/lists.ts)
          colours the site's list rows, so the eye follows it. */}
      <table className="w-full text-sm [&_tbody_tr]:transition-colors [&_tbody_tr:hover]:bg-surface">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="px-4 py-3 text-start font-medium">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-t px-4 py-3 align-top text-muted-foreground">
      {children}
    </td>
  ),
}

// A long article: each section apart with an address to jump to, lists and steps as the site's
// rows, and tables with a grey head.
const ARTICLE_ELEMENTS: typeof ELEMENTS = {
  ...ELEMENTS,
  h2: ({ children }) => (
    <h2
      id={headingId(String(children))}
      className={cn(
        "mt-12 scroll-mt-24 border-t pt-10 font-heading text-2xl font-medium normal-case first:mt-0 first:border-t-0 first:pt-0",
        endsWithQuestionMark(String(children)) && "no-dot"
      )}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="pt-3 text-xl font-medium normal-case">{children}</h3>
  ),
  ul: ({ children }) => (
    <ul className={`${LIST_BOX} overflow-hidden ${ROWS}`}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol
      className={`${LIST_BOX} overflow-hidden ${ROWS} [counter-reset:step] [&>li]:relative [&>li]:ps-16 [&>li]:[counter-increment:step] [&>li]:before:absolute [&>li]:before:start-4 [&>li]:before:top-4 [&>li]:before:flex [&>li]:before:size-8 [&>li]:before:items-center [&>li]:before:justify-center [&>li]:before:rounded-lg [&>li]:before:bg-surface [&>li]:before:font-medium [&>li]:before:content-[counter(step)] [&>li]:hover:before:bg-input sm:[&>li]:ps-[4.5rem] sm:[&>li]:before:start-6`}
    >
      {children}
    </ol>
  ),
  th: ({ children }) => (
    <th className="bg-surface px-4 py-3 text-start font-medium">{children}</th>
  ),
}

/** Markdown from the site's own content files, with tables; `article`, a long page's look. */
export function Markdown({
  text,
  article = false,
}: {
  text: string
  article?: boolean
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={article ? ARTICLE_ELEMENTS : ELEMENTS}
    >
      {text}
    </ReactMarkdown>
  )
}
