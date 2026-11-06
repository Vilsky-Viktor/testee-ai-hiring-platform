"use client"

import { BookmarkIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

import { NoteEditor } from "@/features/company/components/note-editor"
import { NoteRow } from "@/features/company/components/note-row"
import { VirtualList } from "@/components/common/virtual-list"
import { LIST_BOX, LIST_EMPTY } from "@/config/lists"
import { useLocalTime } from "@/hooks/use-local-time"
import { usePagedList } from "@/hooks/use-paged-list"
import { apiFetch } from "@/lib/api"
import { notesPath } from "@/lib/interview-notes"
import { byId } from "@/lib/paged-list"
import type { InterviewNote } from "@/types/company"

/** An interview's notes tab: the box to write a note, the pinned note in a block of its own, then
 * the team's notes by day, newest first, a page at a time; `initial` is the server's first page.
 * Each change refreshes the page, so the menu's count and the pinned line under the title
 * follow. */
export function InterviewNotesTab({
  interviewId,
  initial,
}: {
  interviewId: string
  initial: InterviewNote[]
}) {
  const t = useTranslations("interviews")
  const router = useRouter()
  const localTime = useLocalTime()
  const path = notesPath(interviewId)
  const { items, setItems, loadMore } = usePagedList(path, byId, initial)

  async function post(text: string) {
    const note = await apiFetch<InterviewNote>(path, {
      method: "POST",
      body: JSON.stringify({ text }),
    })
    // After the pinned note, which stays first.
    setItems((current) => {
      const pinned = current[0]?.pinned ? 1 : 0

      return [...current.slice(0, pinned), note, ...current.slice(pinned)]
    })
    router.refresh()
  }

  function changed(note: InterviewNote) {
    setItems((current) =>
      current.map((item) =>
        item.id === note.id
          ? note
          : // Pinning one unpins the other.
            { ...item, pinned: note.pinned ? false : item.pinned }
      )
    )
    router.refresh()
  }

  function removed(noteId: string) {
    setItems((current) => current.filter((item) => item.id !== noteId))
    router.refresh()
  }

  const pinned = items.find((note) => note.pinned)
  const others = items.filter((note) => note !== pinned)
  const day = (note: InterviewNote) => localTime.recentDay(note.created_at)

  function row(note: InterviewNote, dated = false) {
    return (
      <NoteRow
        note={note}
        path={`${path}/${note.id}`}
        dated={dated}
        onChanged={changed}
        onRemoved={() => removed(note.id)}
      />
    )
  }

  return (
    <div className="space-y-6">
      <NoteEditor
        submitLabel={t("notePost")}
        busyLabel={t("notePosting")}
        save={post}
        compact
      />
      {pinned && (
        <div
          className={`${LIST_BOX} overflow-hidden`}
          data-testid="pinned-block"
        >
          <h3 className="flex items-center gap-2 bg-surface px-6 py-2 text-sm text-muted-foreground">
            <BookmarkIcon aria-hidden className="size-4" />
            {t("notePinned")}
          </h3>
          {row(pinned, true)}
        </div>
      )}
      {items.length === 0 && (
        <p data-testid="no-notes" className={LIST_EMPTY}>
          {t("notesEmpty")}
        </p>
      )}
      {others.length > 0 && (
        <VirtualList
          items={others}
          getKey={byId}
          estimateSize={120}
          onEndReached={loadMore}
          className={`${LIST_BOX} overflow-hidden`}
          renderItem={(note, index) => (
            <>
              {/* A day's first note carries the day. */}
              {(index === 0 || day(others[index - 1]) !== day(note)) && (
                <h3
                  suppressHydrationWarning
                  data-testid="note-day"
                  className="bg-surface px-6 py-2 text-sm text-muted-foreground"
                >
                  {day(note)}
                </h3>
              )}
              {row(note)}
            </>
          )}
        />
      )}
    </div>
  )
}
