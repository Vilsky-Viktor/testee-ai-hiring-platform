"use client"

import { cn } from "cn"
import { PlusIcon, SquarePenIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { useState } from "react"

import { TopicChanges } from "@/features/generation/components/topic-changes"
import { TopicEditor } from "@/features/generation/components/topic-editor"
import { RoundFooter } from "@/components/common/round-footer"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ROW_MENU_BUTTON } from "@/config/buttons"
import type { DraftTopic } from "@/types/generation"
import { LIST_BOX, ROW_HOVER } from "@/config/lists"
import { SubtopicList } from "@/components/common/subtopic-list"
import { bdiText } from "@/lib/bidi"

type TopicReviewProps = {
  topics: DraftTopic[]
  maxTopics: number
  // Subtopics a topic may have when edited by hand.
  maxSubtopics: number
  // Subtopics a topic added by hand needs at least.
  minAddedSubtopics: number
  back: ReactNode
  // Shown at the left of the submit row.
  cancel?: ReactNode
  // `edited` is every topic with the reviewer's own changes, or null when nothing was edited.
  onSubmit: (
    selected: number[],
    instructions: string,
    edited: DraftTopic[] | null
  ) => Promise<void>
}

export function TopicReview({
  topics,
  maxTopics,
  maxSubtopics,
  minAddedSubtopics,
  back,
  cancel,
  onSubmit,
}: TopicReviewProps) {
  const t = useTranslations("generation")
  const common = useTranslations("common")
  const [selected, setSelected] = useState(() =>
    topics.map((_, index) => index)
  )
  const [draft, setDraft] = useState(topics)
  const [editing, setEditing] = useState<number | null>(null)
  const [instructions, setInstructions] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const edited = JSON.stringify(draft) !== JSON.stringify(topics)
  const unnamed = draft.some((topic) => !topic.main_topic.trim())
  const unfinished =
    unnamed ||
    draft
      .slice(topics.length)
      .some((topic) => topic.subtopics.length < minAddedSubtopics)
  const asking = instructions.trim().length > 0
  // Approved as it is, the selection must fit the limit; asking the AI, it may merge them.
  const tooMany = !asking && selected.length > maxTopics

  function toggle(index: number, checked: boolean) {
    setSelected((current) =>
      checked
        ? [...current, index].sort((a, b) => a - b)
        : current.filter((item) => item !== index)
    )
  }

  function addTopic() {
    setDraft([...draft, { main_topic: "", subtopics: [] }])
    setSelected([...selected, draft.length])
    setEditing(draft.length)
  }

  function removeTopic(index: number) {
    setDraft(draft.filter((_, item) => item !== index))
    setSelected(
      selected
        .filter((item) => item !== index)
        .map((item) => (item > index ? item - 1 : item))
    )
    setEditing(null)
  }

  // With `words`, the AI revises the chosen topics; without them, they're approved.
  async function send(words: string) {
    setSubmitting(true)
    await onSubmit(selected, words, edited ? draft : null)
    setSubmitting(false)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!asking) {
      void send("")
    }
  }

  const applyDisabled =
    !asking || selected.length === 0 || unfinished || submitting

  return (
    // The bottom padding keeps the last field clear of the sticky footer.
    <form onSubmit={handleSubmit} className="space-y-8 pb-28 max-sm:pb-36">
      <div className="space-y-2">
        <div className="relative">
          {back}
          <h1 className="font-heading text-3xl font-medium tracking-tight">
            {t("reviewTitle")}
          </h1>
        </div>
        <p className="text-muted-foreground">{t("reviewText")}</p>
      </div>

      {/* Above the list, in view however many topics there are: one line until it's used. */}
      <TopicChanges
        value={instructions}
        onChange={setInstructions}
        disabled={applyDisabled}
        onApply={() => send(instructions.trim())}
      />

      <ul className={`${LIST_BOX} overflow-hidden`}>
        {draft.map((topic, index) =>
          editing === index ? (
            <li key={index}>
              <TopicEditor
                topic={topic}
                maxSubtopics={maxSubtopics}
                minSubtopics={
                  index >= topics.length ? minAddedSubtopics : undefined
                }
                onChange={(changed) =>
                  setDraft((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? changed : item
                    )
                  )
                }
                onDone={() => setEditing(null)}
                onRemove={
                  index >= topics.length ? () => removeTopic(index) : undefined
                }
              />
            </li>
          ) : (
            <li key={index} className={`group/row relative ${ROW_HOVER}`}>
              <label className="flex cursor-pointer items-center gap-5 p-6 pe-20">
                <Checkbox
                  className="size-6 shrink-0 [&_[data-slot=checkbox-indicator]>svg]:size-4"
                  checked={selected.includes(index)}
                  onCheckedChange={(checked) => toggle(index, checked)}
                />
                <span
                  className={cn(
                    "space-y-2 transition-opacity",
                    !selected.includes(index) && "opacity-50"
                  )}
                >
                  <span className="block font-medium">{topic.main_topic}</span>
                  <SubtopicList subtopics={topic.subtopics} />
                </span>
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`absolute end-5 top-1/2 -translate-y-1/2 ${ROW_MENU_BUTTON}`}
                aria-label={t.markup("editTopic", {
                  topic: topic.main_topic,
                  ...bdiText,
                })}
                tooltip={common("edit")}
                onClick={() => setEditing(index)}
              >
                <SquarePenIcon />
              </Button>
            </li>
          )
        )}
        <li>
          <button
            type="button"
            onClick={addTopic}
            disabled={editing !== null}
            className={`flex w-full items-center gap-5 p-6 text-start font-medium text-primary disabled:opacity-50 ${ROW_HOVER}`}
          >
            <PlusIcon aria-hidden className="size-6 shrink-0" />
            {t("addTopic")}
          </button>
        </li>
      </ul>

      <RoundFooter className="max-sm:flex-wrap max-sm:gap-y-2">
        <div>{cancel}</div>
        {/* Always there, so a screen reader hears why Approve stopped working. */}
        <p
          role="status"
          data-testid="topics-chosen"
          className={cn(
            "ms-auto text-sm text-muted-foreground max-sm:order-first max-sm:w-full max-sm:text-center",
            (tooMany || asking) && "text-destructive"
          )}
        >
          {tooMany
            ? t("tooMany", { max: maxTopics })
            : asking
              ? t("applyFirst")
              : t("topicsChosen", {
                  chosen: selected.length,
                  count: draft.length,
                })}
        </p>
        <Button
          type="submit"
          className="h-12 px-6 text-base"
          disabled={
            selected.length === 0 ||
            tooMany ||
            asking ||
            unfinished ||
            submitting
          }
        >
          {t("approve")}
        </Button>
      </RoundFooter>
    </form>
  )
}
