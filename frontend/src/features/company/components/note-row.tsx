"use client"

import { KeyRoundIcon, UserIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"
import { toast } from "sonner"

import { NoteEditor } from "@/features/company/components/note-editor"
import { NoteText } from "@/features/company/components/note-text"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { DotsMenu } from "@/components/common/dots-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ROW_HOVER } from "@/config/lists"
import { useLocalTime } from "@/hooks/use-local-time"
import { apiErrorMessage, apiFetch, serviceRefusal } from "@/lib/api"
import { firstGrapheme } from "@/lib/graphemes"
import { noteAuthorName } from "@/lib/interview-notes"
import type { InterviewNote } from "@/types/company"

/** The avatar's mark without a picture: a key for an API key, the name's first letter, or a
 * person's outline. */
function AuthorMark({
  apiKey,
  name,
}: {
  apiKey?: boolean
  name: string | null
}) {
  if (apiKey) {
    return <KeyRoundIcon className="size-5" />
  }

  return name ? firstGrapheme(name) : <UserIcon className="size-5" />
}

/** One note in an interview's notes: its author's picture and name ("former member" once
 * they've left), whether it was edited, when it was written (with its day when `dated`, the list
 * saying it otherwise), its text; and a menu of what the member may do with it, as the backend
 * says: edit, delete, pin. */
export function NoteRow({
  note,
  path,
  dated = false,
  onChanged,
  onRemoved,
}: {
  note: InterviewNote
  dated?: boolean
  // The note's own address in the API.
  path: string
  onChanged: (note: InterviewNote) => void
  onRemoved: () => void
}) {
  const t = useTranslations("interviews")
  const common = useTranslations("common")
  const localTime = useLocalTime()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const name = noteAuthorName(note.author, {
    former: t("noteFormerMember"),
    deletedKey: t("noteDeletedKey"),
  })

  async function save(text: string) {
    const saved = await apiFetch<InterviewNote>(path, {
      method: "PATCH",
      body: JSON.stringify({ text }),
    })
    onChanged(saved)
    setEditing(false)
  }

  async function remove() {
    setDeleting(true)

    try {
      await apiFetch(path, { method: "DELETE" })
      setConfirming(false)
      onRemoved()
    } catch (error) {
      toast.error(
        serviceRefusal(error, [403, 404]) ??
          apiErrorMessage(error, t("noteFailed"))
      )
    } finally {
      setDeleting(false)
    }
  }

  async function pin() {
    try {
      await apiFetch(`${path}/pinned`, {
        method: "PUT",
        body: JSON.stringify({ pinned: !note.pinned }),
      })
      onChanged({ ...note, pinned: !note.pinned })
    } catch (error) {
      toast.error(
        serviceRefusal(error, [403, 404]) ??
          apiErrorMessage(error, t("noteFailed"))
      )
    }
  }

  const items = [
    ...(note.can_pin
      ? [
          {
            label: t(note.pinned ? "noteUnpin" : "notePin"),
            onClick: pin,
            testId: "note-pin",
          },
        ]
      : []),
    ...(note.can_edit
      ? [
          {
            label: common("edit"),
            onClick: () => setEditing(true),
            testId: "note-edit",
          },
        ]
      : []),
    ...(note.can_delete
      ? [
          {
            label: common("delete"),
            onClick: () => setConfirming(true),
            destructive: true,
            testId: "note-delete",
          },
        ]
      : []),
  ]

  return (
    <div
      data-testid="note"
      data-pinned={note.pinned || undefined}
      className={`group/row flex gap-4 p-6 ${ROW_HOVER}`}
    >
      <Avatar size="lg">
        {note.author.photo_url && (
          <AvatarImage src={note.author.photo_url} alt="" />
        )}
        <AvatarFallback>
          <AuthorMark apiKey={note.author.api_key} name={name} />
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <p className="flex min-h-10 min-w-0 flex-1 flex-wrap items-center gap-x-3 text-sm">
            <bdi
              className="min-w-0 font-medium [overflow-wrap:anywhere]"
              data-testid="note-author"
            >
              {name}
            </bdi>
            {note.edited_at && (
              <span className="text-muted-foreground" data-testid="note-edited">
                {t("noteEdited")}
              </span>
            )}
          </p>
          <span className="flex shrink-0 items-center gap-3">
            <time
              dateTime={note.created_at}
              className="text-sm text-muted-foreground tabular-nums"
              suppressHydrationWarning
            >
              {dated
                ? localTime.dateTime(note.created_at)
                : localTime.time(note.created_at)}
            </time>
            {!editing && items.length > 0 && <DotsMenu items={items} />}
          </span>
        </div>
        {/* On phones the text starts under the picture, not beside it (its size-10 and the gap-4). */}
        {editing ? (
          <div className="max-sm:-ms-14">
            <NoteEditor
              initial={note.text}
              submitLabel={common("save")}
              busyLabel={common("saving")}
              save={save}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <NoteText text={note.text} />
        )}
      </div>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title={t("noteDeleteTitle")}
        text={t("noteDeleteText")}
        confirm={deleting ? common("deleting") : common("delete")}
        busy={deleting}
        onConfirm={remove}
      />
    </div>
  )
}
