"use client"

import { useLocale, useTranslations } from "next-intl"

import { VirtualList } from "@/components/common/virtual-list"
import { usePagedList } from "@/hooks/use-paged-list"
import { formatDay } from "@/lib/format"
import { postHeading } from "@/lib/news"
import { byId } from "@/lib/paged-list"
import type { NewsPost } from "@/types/news"
import { LIST_BOX, ROW_HOVER } from "@/config/lists"

/** The news page's posts, newest first, by month. `initial` is the server's first
 * page; the next loads near the end. */
export function NewsList({ initial }: { initial: NewsPost[] }) {
  const t = useTranslations("news")
  const locale = useLocale()
  const { items, loadMore } = usePagedList("/site/news", byId, initial)

  if (items.length === 0) {
    return (
      <p className="py-16 text-center text-muted-foreground">{t("empty")}</p>
    )
  }

  // The calendar month a post's day is in, the same in every time zone.
  const month = (post: NewsPost) =>
    new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(post.published_on))

  return (
    <VirtualList
      items={items}
      getKey={byId}
      estimateSize={160}
      onEndReached={loadMore}
      className={`${LIST_BOX} overflow-hidden`}
      renderItem={(post, index) => (
        <>
          {/* A month's first post carries the month. */}
          {(index === 0 || month(items[index - 1]) !== month(post)) && (
            <h2
              data-testid="news-month"
              className="no-dot bg-surface px-6 py-2 text-sm text-muted-foreground"
            >
              {month(post)}
            </h2>
          )}
          <Post post={post} />
        </>
      )}
    />
  )
}

/** One post: its day in a column of its own (above it, on phones), its title with the site's blue
 * dot, and its text as plain text with its line breaks, kept to a readable width. Its id is the
 * feed's link to it. */
function Post({ post }: { post: NewsPost }) {
  const locale = useLocale()
  const heading = postHeading(post.title)

  return (
    <article
      id={post.id}
      className={`grid gap-x-8 gap-y-2 p-6 ${ROW_HOVER} md:grid-cols-[9rem_minmax(0,1fr)]`}
    >
      <p className="text-sm text-muted-foreground italic md:pt-1.5">
        <time dateTime={post.published_on}>
          {formatDay(post.published_on, locale)}
        </time>
      </p>
      <div className="max-w-3xl min-w-0 space-y-3">
        <h3 className="no-dot font-heading text-2xl font-medium break-words normal-case">
          {heading.text}
          {heading.dot && <span className="blue-dot">.</span>}
        </h3>
        <p className="text-base leading-relaxed break-words whitespace-pre-line text-muted-foreground">
          {post.text}
        </p>
      </div>
    </article>
  )
}
