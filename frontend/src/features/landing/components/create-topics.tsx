"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"

import { DEMO_PRESSED } from "@/features/landing/components/demo-panel"
import { AiPulse } from "@/components/common/ai-pulse"
import { DemoTopicList } from "@/features/landing/components/demo-topic-list"
import { buttonVariants } from "@/components/ui/button"
import { FloatingInput } from "@/components/ui/floating-field"
import { APPLIED, PROPOSED, STEPS } from "@/config/create-demo-steps"
import { useDemoContent } from "@/features/landing/hooks/use-demo-content"
import { countedAt } from "@/hooks/use-demo-steps"

// What's edited in place at each step: the topic's name, then its subtopic.
const EDITING: Record<string, string> = {
  open: "name",
  renaming: "name",
  focusSubtopic: "subtopic",
  adding: "subtopic",
}
const ASKING = ["asking", "aimApply", "apply", "applying"]

/** The create demo's second panel at step `at`, as the topic review simplified for the promo:
 * testee's loading mark until the first topic shows; a topic's name and then one of its subtopics
 * clicked and typed at their end in place; a change asked of the AI in its box over the list and
 * applied, adding a topic; then the topics approved in the footer. The list
 * keeps its full place before rows show, so the panel never changes size. */
export function CreateTopics({ at }: { at: { index: number; n: number } }) {
  const t = useTranslations("generation")
  const landing = useTranslations("landing.create")
  const content = useDemoContent("create")
  const step = STEPS[at.index].name
  const shown = countedAt(STEPS, at, "topics", PROPOSED)
  const renamed = content.renamed.slice(
    0,
    countedAt(STEPS, at, "renaming", content.renamed.length)
  )
  const retyped = content.subtopicAdded.slice(
    0,
    countedAt(STEPS, at, "adding", content.subtopicAdded.length)
  )
  const asking = ASKING.includes(step)
  const asked = countedAt(STEPS, at, "asking", content.change.length)
  const chosen = PROPOSED + (at.index >= APPLIED ? 1 : 0)
  // The request for changes, as the review's box, over the list, Apply inside it.
  const ask = (
    <span data-demo-target="ask" className="relative block">
      <FloatingInput
        label={t("changes")}
        placeholder={t("changesPlaceholder")}
        value={asking ? content.change.slice(0, asked) : ""}
        readOnly
        caret={step === "asking"}
        boxClassName={cn(step === "asking" && "border-ring-gradient")}
        className="placeholder:normal-case"
        action={
          <span
            data-demo-target="apply"
            className={buttonVariants({
              className: cn(
                "h-10 shrink-0 rounded-lg px-4 text-base transition-opacity",
                (!asking || step === "applying") && "opacity-50",
                step === "apply" && DEMO_PRESSED
              ),
            })}
          >
            {t("apply")}
          </span>
        }
      />
    </span>
  )

  return (
    <div className="relative flex min-w-0 flex-1 flex-col gap-3 p-2 pt-10 pb-5">
      {/* Until the first topic shows, the generating page over the whole screen: testee's loading
          mark over its title and its note. */}
      {shown === 0 && (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-5 text-center">
          <span data-float>
            <AiPulse className="size-24" />
          </span>
          <span className="font-heading text-5xl font-medium tracking-tight text-balance">
            {t("drafting")}
          </span>
          <span className="max-w-md text-base text-balance text-muted-foreground">
            {landing("draftingNote")}
          </span>
        </span>
      )}
      <div
        className={cn(
          "transition-opacity duration-500",
          shown === 0 && "invisible opacity-0"
        )}
      >
        {ask}
      </div>
      <div className="relative grid grid-cols-[minmax(0,1fr)] items-start *:[grid-area:1/1]">
        <div className="invisible">
          <DemoTopicList
            shown={PROPOSED}
            applied
            renamed={content.renamed}
            retyped={content.subtopicAdded}
            editing={null}
          />
        </div>
        {shown > 0 && (
          <DemoTopicList
            aimed
            shown={shown}
            applied={at.index >= APPLIED}
            renamed={renamed}
            retyped={retyped}
            editing={EDITING[step] ?? null}
          />
        )}
      </div>
      {/* The review's footer comes with the topics: how many are chosen, and approving them. */}
      <div
        className={cn(
          "mt-auto flex items-center justify-end gap-4 border-t pt-3 transition-opacity duration-500",
          shown === 0 && "invisible opacity-0"
        )}
      >
        <span className="text-sm text-muted-foreground tabular-nums">
          {t("topicsChosen", { chosen: chosen, count: chosen })}
        </span>
        <span
          data-demo-target="go"
          className={buttonVariants({
            className: cn(
              "h-11 px-6 text-base transition-opacity",
              asking && "opacity-50",
              step === "go" && DEMO_PRESSED
            ),
          })}
        >
          {t("approve")}
        </span>
      </div>
    </div>
  )
}
