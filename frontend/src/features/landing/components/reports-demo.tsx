"use client"

import { cn } from "cn"
import { useTranslations } from "next-intl"
import { useMemo, useState } from "react"

import { DemoCandidates } from "@/features/landing/components/demo-candidates"
import { DemoChat } from "@/features/landing/components/demo-chat"
import { DemoDownloadCue } from "@/features/landing/components/demo-download-cue"
import { DemoNotes } from "@/features/landing/components/demo-notes"
import { DemoPanel } from "@/features/landing/components/demo-panel"
import { DemoPointer } from "@/features/landing/components/demo-pointer"
import { DemoReport } from "@/features/landing/components/demo-report"
import { DemoSentNotice } from "@/features/landing/components/demo-popup"
import { DemoSharePopup } from "@/features/landing/components/demo-share"
import { DemoSlackChannel } from "@/features/landing/components/demo-slack-channel"
import { PromoBurst } from "@/features/landing/components/promo-burst"
import { useSpotlight } from "@/features/landing/hooks/use-spotlight"
import { useClickBump } from "@/features/landing/hooks/use-click-bump"
import {
  litField,
  messagesAt,
  popupPressed,
} from "@/features/landing/utils/reports-demo"
import {
  DEMO_BEST,
  DEMO_FLAGGED,
  DEMO_RUNNER_UP,
  DEMO_SHARE_EMAIL,
} from "@/config/reports-demo"
import { useReportCandidates } from "@/features/landing/hooks/use-demo-content"
import {
  REPORT_BURSTS,
  REPORT_SCREEN_ORDER,
  REPORT_TARGETS,
  type ReportStep,
  reportSteps,
} from "@/config/reports-demo-steps"
import {
  countedAt,
  pointedAt,
  stepIndex,
  useDemoSteps,
} from "@/hooks/use-demo-steps"
import { bdi } from "@/lib/bidi"

// The list's action pressed at each step that presses one.
const LIST_PRESSES: Record<string, "download" | "share"> = {
  download: "download",
  share: "share",
}

// The menu item the pointer heads for at each step.
const LIST_AIMS: Record<string, "download" | "share"> = {
  aimDownload: "download",
  aimShare: "share",
}

/** Reports and sharing, played by a pointer in one panel of a fixed size: the interview's
 * candidates, their PDF downloaded and emailed to the manager; the best candidate's page shared
 * to WhatsApp (its text summary, then a line typed); the flagged one's the same; then a note
 * posted on the interview's notes, and last the Slack channel with testee's messages. The share
 * dialog, the download and the notices lie over the screens. Played as a promo that stays
 * readable, as the create demo is (create-flow.tsx): the frame holds still, never magnifying;
 * whatever is clicked jumps as the click lands (promo-click.css); a field's background lights up
 * before it's typed in; screens rise into place; the dialog and the notices fly up, rows fly in,
 * the report's parts pop in, its grade counts up, chat and Slack messages arrive, and a burst
 * marks the big moments (`data-promo`, `data-reports-promo`: promo-sections.css). With reduced motion,
 * the Slack channel at its newest message, still. */
export function ReportsDemo() {
  const t = useTranslations("landing.shareReports")
  const report = useTranslations("report")
  const candidates = useReportCandidates()
  const lines: [string, string] = [t("chat.best"), t("chat.flagged")]
  const note = t("proceeding", {
    first: candidates[DEMO_BEST].name,
    second: candidates[DEMO_RUNNER_UP].name,
  })
  const steps = useMemo(
    () => reportSteps(DEMO_BEST, DEMO_FLAGGED, lines, DEMO_SHARE_EMAIL, note),
    // The texts decide the steps' lengths.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lines[0], lines[1], note]
  )
  const { ref, ...at } = useDemoSteps<HTMLDivElement>(steps)
  const step = steps[at.index]
  const after = (name: string) => at.index >= stepIndex(steps, name)
  // What the pointer moves to: found in the screen shown when the pointer looks for it.
  const [targets] = useState(() =>
    Object.fromEntries(
      REPORT_TARGETS.map((name) => [
        name,
        {
          get current() {
            return (
              ref.current?.querySelector<HTMLElement>(
                `[data-shown=true] [data-demo-target=${name}], [data-overlay] [data-demo-target=${name}]`
              ) ?? null
            )
          },
        },
      ])
    )
  )
  const point = pointedAt(steps, at.index)
  const target = targets[point ?? ""] ?? null
  const turn = after("aimRow1") ? 1 : 0
  const typedTurn = countedAt(steps, at, `typing${turn}`, lines[turn].length)
  const chatTyped = after(`sent${turn}`) ? "" : lines[turn].slice(0, typedTurn)
  useSpotlight(targets[litField(step.name, point)], at.index)
  // What the pointer clicks jumps as the click lands.
  useClickBump(target, step.click === true, at.index)

  // A screen, shown while it's the step's: it rises into place from a little smaller and out of
  // focus, as the one before lifts away, growing and fading; by its place in the demo's order.
  function screen(shown: boolean, key: string, content: React.ReactNode) {
    const order =
      REPORT_SCREEN_ORDER[key.replace(/\d+$/, "") as ReportStep["screen"]]

    return (
      <div
        key={key}
        data-shown={shown}
        className={cn(
          "flex min-h-0 flex-col transition-[opacity,translate,scale,filter,visibility] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transform-none motion-reduce:filter-none",
          shown
            ? "delay-200 duration-700"
            : cn(
                "invisible opacity-0 blur-sm duration-300",
                order >= REPORT_SCREEN_ORDER[step.screen]
                  ? "translate-y-8 scale-95"
                  : "-translate-y-6 scale-105"
              )
        )}
      >
        {content}
      </div>
    )
  }

  return (
    <div
      data-testid="reports-demo"
      data-step={step.name}
      data-promo
      data-reports-promo
      className="w-full"
    >
      <DemoPanel ref={ref}>
        {/* The screens, what lies over them and the pointer, cut at the frame. It fills the
            frame's padding, so the dialog's shade still reaches its edges. */}
        <div className="relative -m-3 flex flex-1 flex-col overflow-hidden rounded-[inherit]">
          <div className="relative flex flex-1 flex-col p-3">
            <DemoPointer
              target={target}
              clicking={step.click === true}
              click={at.index}
            />
            {/* As tall on every screen, so nothing moves as they change. */}
            <div className="grid h-176 grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] p-2 *:min-w-0 *:[grid-area:1/1] max-sm:h-160 sm:h-152 sm:p-5">
              {screen(
                step.screen === "list",
                "list",
                <DemoCandidates
                  shown={step.screen === "list"}
                  menu={step.menu === true}
                  aimed={LIST_AIMS[step.name] ?? null}
                  pressed={LIST_PRESSES[step.name] ?? null}
                  opened={
                    step.name.startsWith("openRow")
                      ? (step.candidate ??
                        steps[at.index + 1]?.candidate ??
                        null)
                      : null
                  }
                />
              )}
              {[DEMO_BEST, DEMO_FLAGGED].map((candidate) =>
                screen(
                  step.screen === "page" && step.candidate === candidate,
                  `page${candidate}`,
                  <DemoReport
                    candidate={candidates[candidate]}
                    active={step.candidate === candidate}
                    best={candidate === DEMO_BEST}
                    scrolled={step.scrolled ?? 0}
                    menu={step.menu === true}
                    aimed={step.name.startsWith("aimShare")}
                    pressed={step.name.startsWith("share")}
                    expanded={step.expanded === true}
                  />
                )
              )}
              {screen(
                step.screen === "chat",
                "chat",
                <DemoChat
                  messages={messagesAt(steps, at.index, lines, candidates)}
                  typed={chatTyped}
                  typing={step.name === `typing${turn}`}
                  pressed={step.name === `send${turn}`}
                />
              )}
              {screen(
                step.screen === "slack",
                "slack",
                <DemoSlackChannel
                  shown={step.screen === "slack"}
                  scrolled={after("slackScrolled")}
                  note={note}
                />
              )}
              {screen(
                step.screen === "notes",
                "notes",
                <DemoNotes
                  typed={
                    after("post")
                      ? ""
                      : note.slice(
                          0,
                          countedAt(steps, at, "typingNote", note.length)
                        )
                  }
                  pressed={step.name === "post"}
                  posted={after("posted") ? note : null}
                />
              )}
            </div>
            <div data-overlay>
              <DemoSharePopup
                open={step.popup === true}
                email={
                  step.screen === "list"
                    ? DEMO_SHARE_EMAIL.slice(
                        0,
                        countedAt(
                          steps,
                          at,
                          "typingEmail",
                          DEMO_SHARE_EMAIL.length
                        )
                      )
                    : ""
                }
                typing={["focusEmail", "typingEmail"].includes(step.name)}
                pressed={popupPressed(step.name)}
              />
            </div>
            <DemoDownloadCue shown={step.download === true} />
            <DemoSentNotice
              shown={step.notice === true}
              text={report.rich("sent", { email: DEMO_SHARE_EMAIL, ...bdi })}
            />
          </div>
          {REPORT_BURSTS.has(step.name) && <PromoBurst key={step.name} />}
        </div>
      </DemoPanel>
    </div>
  )
}
