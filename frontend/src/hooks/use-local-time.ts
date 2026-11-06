"use client"

import { useLocale } from "next-intl"

import {
  formatDate,
  formatDateTime,
  formatRecentDay,
  formatTime,
} from "@/lib/format"
import { useInBrowser } from "@/hooks/use-in-browser"
import { timeTag } from "@/lib/time-tag"

/** Formats moments in the visitor's own time zone: the server renders them in UTC, and the
 * browser's first render matches it, then shows the local date (a top-up at 20:00 in New York
 * isn't the next day's). */
export function useLocalTime() {
  const locale = useLocale()
  const inBrowser = useInBrowser()
  const timeZone = inBrowser ? undefined : "UTC"
  const date = (iso: string) => formatDate(iso, locale, timeZone)
  const dateTime = (iso: string) => formatDateTime(iso, locale, timeZone)

  return {
    date,
    dateTime,
    time: (iso: string) => formatTime(iso, locale, timeZone),
    recentDay: (iso: string) => formatRecentDay(iso, locale, timeZone),
    // For `t.rich`: a message's `<time>{date}</time>`, the moment's date in a `<time>` element.
    dateValues: (iso: string) => ({ date: date(iso), ...timeTag(iso) }),
  }
}
