import { useTranslations } from "next-intl"

/** A search's loading state: a primary light gliding along the field's bottom edge (the voice
 * screen's line-sweep), kept inside the field's corners; announced to screen readers. The field
 * is its positioned parent. */
export function SearchProgress({ loading }: { loading: boolean }) {
  const t = useTranslations("search")

  return (
    <span role="status">
      {loading && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] rtl:-scale-x-100"
          >
            <span className="absolute start-0 bottom-0 h-0.5 w-1/3 animate-[line-sweep_1.2s_ease-in-out_infinite_alternate] bg-linear-to-r from-transparent via-primary to-transparent" />
          </span>
          <span className="sr-only">{t("searching")}</span>
        </>
      )}
    </span>
  )
}
