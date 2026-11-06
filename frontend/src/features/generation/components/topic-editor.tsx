"use client"

import { cn } from "cn"
import { PlusIcon, XIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useId, useState } from "react"

import { Button } from "@/components/ui/button"
import { FloatingInput } from "@/components/ui/floating-field"
import { MAX_TOPIC_NAME_LENGTH } from "@/config/limits"
import type { DraftTopic } from "@/types/generation"
import { bdiText } from "@/lib/bidi"

type TopicEditorProps = {
  topic: DraftTopic
  maxSubtopics: number
  // The subtopics it needs at least: only a topic the reviewer added has any.
  minSubtopics?: number
  onChange: (topic: DraftTopic) => void
  onDone: () => void
  // Only a topic the reviewer added can go; a drafted one is unticked instead.
  onRemove?: () => void
}

/** Rename a topic and change its subtopics by hand, without asking the model. */
export function TopicEditor({
  topic,
  maxSubtopics,
  minSubtopics = 0,
  onChange,
  onDone,
  onRemove,
}: TopicEditorProps) {
  const t = useTranslations("generation")
  const nameError = useId()
  const [newSubtopic, setNewSubtopic] = useState("")
  const name = topic.main_topic.trim()
  const full = topic.subtopics.length >= maxSubtopics
  const tooFew = topic.subtopics.length < minSubtopics

  function addSubtopic() {
    const subtopic = newSubtopic.trim()

    if (subtopic && !full && !topic.subtopics.includes(subtopic)) {
      onChange({ ...topic, subtopics: [...topic.subtopics, subtopic] })
    }

    setNewSubtopic("")
  }

  function removeSubtopic(index: number) {
    onChange({
      ...topic,
      subtopics: topic.subtopics.filter((_, item) => item !== index),
    })
  }

  return (
    <div className="space-y-4 p-6">
      <div>
        <FloatingInput
          label={t("topicName")}
          maxLength={MAX_TOPIC_NAME_LENGTH}
          value={topic.main_topic}
          onChange={(event) =>
            onChange({ ...topic, main_topic: event.target.value })
          }
          aria-invalid={!name}
          aria-describedby={name ? undefined : nameError}
          className="font-medium normal-case"
          autoFocus
        />
        {/* Always there, so a screen reader hears it as the name is cleared. */}
        <p
          id={nameError}
          role="status"
          className={cn("text-sm text-destructive", !name && "mt-2")}
        >
          {!name && t("topicNameNeeded")}
        </p>
      </div>

      <ul className="flex flex-wrap gap-2">
        {topic.subtopics.map((subtopic, index) => (
          <li
            key={subtopic}
            className="flex items-center gap-1 rounded-full bg-surface py-1.5 ps-4 pe-1.5 text-sm"
          >
            {subtopic}
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="rounded-full"
              aria-label={t.markup("removeSubtopic", { subtopic, ...bdiText })}
              onClick={() => removeSubtopic(index)}
            >
              <XIcon />
            </Button>
          </li>
        ))}
      </ul>

      <p role="status" className="text-sm text-muted-foreground empty:hidden">
        {tooFew && t("subtopicsNeeded", { count: minSubtopics })}
      </p>

      {/* The new subtopic's field, half the row, with its add button inside; Done at the row's
          end. Lined up at the bottom, under the field's raised name. */}
      <div className="flex items-end justify-between gap-2">
        <FloatingInput
          label={t("newSubtopic")}
          boxClassName="w-1/2 max-sm:flex-1"
          maxLength={MAX_TOPIC_NAME_LENGTH}
          value={newSubtopic}
          onChange={(event) => setNewSubtopic(event.target.value)}
          onKeyDown={(event) => {
            // Enter adds the subtopic instead of submitting the review.
            if (event.key === "Enter") {
              event.preventDefault()
              addSubtopic()
            }
          }}
          placeholder={
            full
              ? t("subtopicsFull", { count: maxSubtopics })
              : t("addSubtopic")
          }
          disabled={full}
          className="normal-case"
          action={
            <Button
              type="button"
              size="icon-lg"
              className="shrink-0 rounded-lg"
              aria-label={t("addSubtopic")}
              disabled={full || !newSubtopic.trim()}
              onClick={addSubtopic}
            >
              <PlusIcon />
            </Button>
          }
        />
        <div className="flex shrink-0 items-center gap-2">
          {onRemove && (
            <Button
              type="button"
              variant="outline"
              className="h-13.5 px-5 text-base"
              onClick={onRemove}
            >
              {t("removeTopic")}
            </Button>
          )}
          <Button
            type="button"
            className="h-13.5 px-5 text-base"
            disabled={!name || tooFew}
            onClick={onDone}
          >
            {t("done")}
          </Button>
        </div>
      </div>
    </div>
  )
}
