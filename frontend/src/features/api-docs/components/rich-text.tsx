import Link from "next/link"

import { HighlightedCode } from "@/components/common/highlighted-code"
import { KeepAcronyms } from "@/components/common/keep-acronyms"
import { TEXT_LINK } from "@/config/links"
import { LIST_BOX, ROW_HOVER, ROW_ICON } from "@/config/lists"
import { richText, slugOf } from "@/lib/openapi"

type Section = ReturnType<typeof richText>[number]
type Pieces = Section["blocks"][number]["pieces"]

const TEXT = "text-base leading-relaxed text-muted-foreground"

/** A description from the API: its sections, the titled ones under a title like the page's others
 * ("## Keys"), with paragraphs, numbered steps, lists, tables and code. `only` keeps those
 * sections, in the text's order (null: the text before the first title). */
export function RichText({
  text,
  only,
}: {
  text: string
  only?: readonly (string | null)[]
}) {
  return richText(text)
    .filter((section) => !only || only.includes(section.title))
    .map((section, index) =>
      section.title ? (
        <section
          key={index}
          id={slugOf(section.title)}
          className="scroll-mt-24 space-y-5"
        >
          <h2 className="font-heading text-2xl font-medium">
            <KeepAcronyms text={section.title} />
          </h2>
          <Blocks blocks={section.blocks} />
        </section>
      ) : (
        <Blocks key={index} blocks={section.blocks} />
      )
    )
}

function Blocks({ blocks }: { blocks: Section["blocks"] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  )
}

function Block({ block }: { block: Section["blocks"][number] }) {
  if (block.code !== undefined) {
    return <HighlightedCode variants={block.code} />
  }

  if (block.table) {
    return <Table rows={block.table} />
  }

  if (block.list) {
    return <Rows items={block.list} />
  }

  if (block.steps) {
    return <Rows items={block.steps} numbered />
  }

  return (
    <p className={`max-w-4xl ${TEXT}`}>
      <Inline pieces={block.pieces} />
    </p>
  )
}

/** Steps or a list as the site's rows, steps numbered in the rows' tiles. */
function Rows({ items, numbered }: { items: Pieces[]; numbered?: boolean }) {
  const Tag = numbered ? "ol" : "ul"

  return (
    <Tag className={`${LIST_BOX} overflow-hidden`}>
      {items.map((item, index) => (
        <li
          key={index}
          className={`group/row flex items-start gap-4 p-4 sm:px-6 ${ROW_HOVER}`}
        >
          {numbered && (
            <span aria-hidden className={`${ROW_ICON} size-8 font-medium`}>
              {index + 1}
            </span>
          )}
          <span className={`min-w-0 flex-1 ${TEXT}`}>
            <Inline pieces={item} />
          </span>
        </li>
      ))}
    </Tag>
  )
}

/** A table in one box; on phones each row's cells stack. */
function Table({ rows }: { rows: Pieces[][] }) {
  const [head, ...body] = rows

  return (
    <div className={`${LIST_BOX} overflow-hidden`} role="table">
      <div
        role="row"
        className="grid gap-4 bg-surface px-6 py-2 text-sm text-muted-foreground max-sm:hidden sm:grid-cols-[minmax(0,14rem)_4rem_minmax(0,1fr)]"
      >
        {head.map((cell, index) => (
          <span key={index} role="columnheader">
            <Inline pieces={cell} />
          </span>
        ))}
      </div>
      {body.map((row, index) => (
        <div
          key={index}
          role="row"
          className={`grid gap-x-4 gap-y-1 px-6 py-3 ${ROW_HOVER} sm:grid-cols-[minmax(0,14rem)_4rem_minmax(0,1fr)]`}
        >
          {row.map((cell, at) => (
            <span
              key={at}
              role="cell"
              className="min-w-0 text-sm break-words text-muted-foreground"
            >
              <Inline pieces={cell} />
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

/** One line of a description, its code, bold and links marked as in the longer texts. */
export function RichLine({ text }: { text: string }) {
  const [section] = richText(text)

  return <Inline pieces={section?.blocks[0]?.pieces ?? []} />
}

function Inline({ pieces }: { pieces: Pieces }) {
  return pieces.map((piece, at) =>
    piece.kind === "bold" ? (
      <strong key={at} className="font-medium text-foreground">
        {piece.text}
      </strong>
    ) : piece.kind === "link" ? (
      <Link key={at} href={piece.href} className={TEXT_LINK}>
        {piece.text}
      </Link>
    ) : piece.kind === "code" ? (
      <code
        key={at}
        className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-sm text-foreground group-hover/row:bg-input"
      >
        {piece.text}
      </code>
    ) : (
      piece.text
    )
  )
}
