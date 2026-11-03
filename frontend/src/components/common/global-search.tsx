"use client"

import { Combobox } from "@base-ui/react/combobox"
import { cn } from "cn"
import { SearchIcon, XIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"

import { useUrlLocale } from "@/components/common/localized-link"
import { Dotted } from "@/components/common/dot"
import { IconButton } from "@/components/common/icon-button"
import { SearchProgress } from "@/components/common/search-progress"
import { MAX_SEARCH_LENGTH } from "@/config/limits"
import { SEARCH_DELAY_MS } from "@/config/lists"
import { localizeHref } from "@/lib/locale-path"
import { searchSite } from "@/lib/search"
import { useAuth } from "@/providers/auth-provider"
import type { SearchResult } from "@/types/search"

// The results' list, which the phone's bar doesn't close for when tapped.
const RESULTS_SLOT = "search-results"

/** The header's search over every kind of page: the signed-in user's companies, interviews and
 * candidates, the site's pages, guides, comparisons, legal texts and FAQ, and the skills tests.
 * It asks once typing pauses (no button) and lists up to five, each with what it is; picking one
 * opens it. From md up the field fills the header's height and the room between its links and
 * its buttons (HeaderSearch); on phones a magnifier opens it in a bar under the header
 * (PhoneSearch). */
export function HeaderSearch() {
  return (
    <div className="mx-6 hidden min-w-0 flex-1 self-stretch md:flex lg:mx-14">
      <SearchBox className="h-full w-full" />
    </div>
  )
}

export function PhoneSearch() {
  const t = useTranslations("search")
  const [open, setOpen] = useState(false)
  // The magnifier and the bar: a tap anywhere else (but the results) closes the bar.
  const toggle = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }

    const onTap = (event: PointerEvent) => {
      const target = event.target as Element

      if (
        !toggle.current?.contains(target) &&
        !bar.current?.contains(target) &&
        !target.closest?.(`[data-slot="${RESULTS_SLOT}"]`)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("pointerdown", onTap)

    return () => document.removeEventListener("pointerdown", onTap)
  }, [open])

  return (
    <>
      <span ref={toggle} className="flex md:hidden">
        <IconButton
          label={open ? t("close") : t("open")}
          pressed={open}
          onClick={() => setOpen(!open)}
          // As big as the bell beside it.
          className="size-8"
        >
          {open ? (
            <XIcon className="size-5" />
          ) : (
            <SearchIcon className="size-5" />
          )}
        </IconButton>
      </span>
      {open && (
        <div
          ref={bar}
          className="absolute inset-x-0 top-14 z-40 border-b bg-background md:hidden"
        >
          <SearchBox
            className="h-14"
            autoFocus
            onOpened={() => setOpen(false)}
          />
        </div>
      )}
    </>
  )
}

function SearchBox({
  className,
  autoFocus,
  onOpened,
}: {
  className?: string
  autoFocus?: boolean
  // After a result is picked (the phone's bar closes).
  onOpened?: () => void
}) {
  const t = useTranslations("search")
  const locale = useLocale()
  const urlLocale = useUrlLocale()
  const router = useRouter()
  const { user } = useAuth()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  // Set while a picked result is opened: the field takes no text from the pick (the combobox
  // would write the result's title into it).
  const picking = useRef(false)
  // The result the arrow keys are on, opened by Enter.
  const highlighted = useRef<SearchResult | undefined>(undefined)
  // The whole field, magnifier included, so the list is as wide as it.
  const field = useRef<HTMLDivElement>(null)
  const [found, setFound] = useState<{ q: string; rows: SearchResult[] }>({
    q: "",
    rows: [],
  })
  // The query whose request is on its way, for the spinner at the field's end.
  const [sent, setSent] = useState("")
  const q = query.trim()
  const rows = q && found.q === q ? found.rows : []
  const loading = q !== "" && sent === q && found.q !== q

  useEffect(() => {
    if (!q) {
      return
    }

    let current = true
    const timer = window.setTimeout(() => {
      setSent(q)
      searchSite(q, locale, Boolean(user)).then((results) => {
        if (current) {
          setFound({ q, rows: results })
        }
      })
    }, SEARCH_DELAY_MS)

    return () => {
      current = false
      window.clearTimeout(timer)
    }
  }, [q, locale, user])

  // Picking a result closes the list, empties the field and opens the result's page.
  function pick(result: SearchResult) {
    picking.current = true
    highlighted.current = undefined
    setOpen(false)
    setQuery("")
    setFound({ q: "", rows: [] })
    ;(document.activeElement as HTMLElement | null)?.blur()
    onOpened?.()
    router.push(localizeHref(urlLocale, result.path))
    window.setTimeout(() => {
      picking.current = false
    })
  }

  return (
    <Combobox.Root
      items={rows}
      value={null}
      inputValue={query}
      onInputValueChange={(text: string) => {
        if (!picking.current) {
          setQuery(text)
        }
      }}
      open={open}
      onOpenChange={setOpen}
      // A click picks through the combobox, Enter on the highlighted result through the field.
      onValueChange={(result: SearchResult | null) => result && pick(result)}
      onItemHighlighted={(result: SearchResult | undefined) => {
        highlighted.current = result
      }}
      itemToStringLabel={(result: SearchResult) => result.title}
      isItemEqualToValue={(a: SearchResult, b: SearchResult) => a.key === b.key}
      // The services search; the list shows what they found.
      filter={null}
    >
      <div
        ref={field}
        className={cn(
          "relative flex items-center gap-3 bg-surface px-5",
          className
        )}
      >
        <Combobox.Input
          onKeyDown={(event) => {
            if (event.key === "Enter" && highlighted.current) {
              event.preventDefault()
              pick(highlighted.current)
            }
          }}
          maxLength={MAX_SEARCH_LENGTH}
          placeholder={t("placeholder")}
          aria-label={t("label")}
          autoFocus={autoFocus}
          dir="auto"
          className="h-full w-full min-w-0 bg-transparent text-lg outline-none placeholder:text-placeholder"
        />
        <SearchProgress loading={loading} />
      </div>
      {/* Opens once something typed has been searched: what was found, or that nothing was. */}
      {q && found.q === q && (
        <Combobox.Portal>
          <Combobox.Positioner
            anchor={field}
            // Straight under the header's border, as if the field opened downwards.
            sideOffset={1}
            align="start"
            className="z-50"
          >
            <Combobox.Popup
              data-slot={RESULTS_SLOT}
              className="w-(--anchor-width) overflow-hidden rounded-b-xl bg-popover text-popover-foreground shadow-md"
            >
              <Combobox.Empty className="px-4 py-3 text-sm text-muted-foreground empty:hidden">
                {t("empty")}
              </Combobox.Empty>
              <Combobox.List className="p-1 empty:hidden">
                {(result: SearchResult) => (
                  <Combobox.Item
                    key={result.key}
                    value={result}
                    className="flex cursor-default items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm outline-none select-none data-highlighted:bg-surface data-highlighted:text-accent-foreground"
                  >
                    <span className="min-w-0">
                      <span className="block truncate normal-case" dir="auto">
                        {result.title}
                      </span>
                      {result.context && (
                        <span className="block truncate text-xs text-muted-foreground normal-case [&_span[aria-hidden]]:mx-1.5 [&_span[aria-hidden]]:size-1 [&_span[aria-hidden]]:align-[calc(0.33em-0.125rem)]">
                          <Dotted
                            items={result.context.map((part) => (
                              <bdi key={part}>{part}</bdi>
                            ))}
                          />
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 text-xs text-muted-foreground in-data-highlighted:bg-background">
                      {t(`kinds.${result.kind}`)}
                    </span>
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          </Combobox.Positioner>
        </Combobox.Portal>
      )}
    </Combobox.Root>
  )
}
