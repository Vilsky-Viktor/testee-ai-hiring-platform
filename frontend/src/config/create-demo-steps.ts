// The home page's "create an interview" demo: its steps, and what its pointer moves to in each
// panel.
import {
  DEMO_COMPANY,
  DEMO_EDITED,
  DEMO_EDITED_SUBTOPIC,
  DEMO_INVITE_EMAIL,
  DEMO_INVITE_NAME,
  DEMO_QUESTION_SECONDS,
} from "@/config/create-demo"
import type { CreateContent } from "@/features/landing/types/demo-content"
import { type DemoStep, stepIndex } from "@/hooks/use-demo-steps"

// How many topics are proposed, and how many the questions are written for (the AI adds one).
export const PROPOSED = 3
export const WRITTEN = PROPOSED + 1

/** The topics the questions are written for, in `content`'s language: the adjusted ones, the
 * edited one with its name and subtopic as typed. */
export function adjusted(content: CreateContent) {
  return [
    ...Object.values(content.topics).slice(0, PROPOSED),
    content.newTopic,
  ].map((topic, place) =>
    place === DEMO_EDITED
      ? {
          name: topic.name + content.renamed,
          subtopics: topic.subtopics.map((subtopic, at) =>
            at === DEMO_EDITED_SUBTOPIC
              ? subtopic + content.subtopicAdded
              : subtopic
          ),
        }
      : topic
  )
}

// The pointer right-clicks the empty box, picks paste from its menu and the whole description
// shows, then it clicks send; the screen asking for the company's name slides in, it types
// the name and clicks continue; the loading
// mark stands for the interview being made until it's ready. The topics show
// one by one; it clicks a topic's name and types at its end, then one of its subtopics, editing
// both in place, then types into the request for changes and clicks apply, and a topic is added; then it clicks
// approve, the questions are written, topic by topic, and the interview is ready: it changes the
// questions each candidate gets on two topics, opens the settings tab, sets the time per question
// and clicks the back arrow to the interview, clicks to invite, the invite dialog opens, a
// candidate's email and name are typed and sent, and the "sent" notice shows. Then the inbox:
// the invitation arrives, the pointer opens it, and clicks its button. Last, the still frame.
// The steps typing a text of the page's language get its length in createSteps.
export const STEPS: DemoStep[] = [
  { name: "empty", ms: 500, point: "field" },
  { name: "menu", ms: 300, click: true },
  { name: "aimPaste", ms: 700, point: "paste" },
  { name: "paste", ms: 400, click: true },
  { name: "pasted", ms: 400 },
  { name: "aim", ms: 1000, point: "send" },
  { name: "send", ms: 500, click: true },
  // The company's screen slides in while the pointer rests on send; each move then glides
  // (700 ms) and rests a moment before its click.
  { name: "company", ms: 700 },
  { name: "aimName", ms: 1000, point: "name" },
  { name: "focusName", ms: 300, click: true },
  { name: "naming", ms: 90, repeat: DEMO_COMPANY.length },
  { name: "named", ms: 250 },
  { name: "aimContinue", ms: 1000, point: "continue" },
  { name: "continue", ms: 500, click: true },
  // The company's screen stays a moment, then the topics come.
  { name: "closing", ms: 500, point: "none" },
  // The generating page, long enough to read, before the first topic shows.
  { name: "sent", ms: 2600 },
  { name: "topics", ms: 400, repeat: PROPOSED },
  // A topic's name, then one of its subtopics, clicked and typed at their end in place.
  { name: "review", ms: 600, point: "edit" },
  { name: "open", ms: 300, click: true },
  { name: "renaming", ms: 90 },
  { name: "aimSubtopic", ms: 700, point: "subtopic" },
  { name: "focusSubtopic", ms: 300, click: true },
  { name: "adding", ms: 90 },
  { name: "edited", ms: 700, point: "ask" },
  { name: "ask", ms: 300, click: true },
  { name: "asking", ms: 50 },
  { name: "aimApply", ms: 800, point: "apply" },
  { name: "apply", ms: 500, click: true },
  { name: "applying", ms: 500, point: "none" },
  { name: "applied", ms: 600 },
  { name: "aimGo", ms: 800, point: "go" },
  { name: "go", ms: 500, click: true },
  { name: "writing", ms: 700, repeat: WRITTEN, point: "none" },
  { name: "written", ms: 700 },
  { name: "ready", ms: 1200 },
  { name: "aimLimit0", ms: 800, point: "limit0" },
  { name: "focusLimit0", ms: 300, click: true },
  { name: "limit0", ms: 700 },
  { name: "aimLimit1", ms: 800, point: "limit1" },
  { name: "focusLimit1", ms: 300, click: true },
  { name: "limit1", ms: 700 },
  { name: "aimSettings", ms: 800, point: "settingsTab" },
  { name: "openSettings", ms: 400, click: true },
  { name: "settings", ms: 900, point: "none" },
  { name: "aimSeconds", ms: 700, point: "seconds" },
  { name: "focusSeconds", ms: 300, click: true },
  { name: "typingSeconds", ms: 150, repeat: DEMO_QUESTION_SECONDS.length },
  { name: "secondsSet", ms: 500 },
  { name: "aimBack", ms: 800, point: "backLink" },
  { name: "back", ms: 400, click: true },
  { name: "aimInvite", ms: 800, point: "invite" },
  { name: "invite", ms: 500, click: true },
  { name: "aimEmail", ms: 700, point: "email" },
  { name: "focusEmail", ms: 300, click: true },
  { name: "typingEmail", ms: 35, repeat: DEMO_INVITE_EMAIL.length },
  { name: "aimInviteName", ms: 700, point: "inviteName" },
  { name: "focusInviteName", ms: 300, click: true },
  { name: "typingName", ms: 35, repeat: DEMO_INVITE_NAME.length },
  { name: "aimSendInvite", ms: 700, point: "sendInvite" },
  { name: "sendInvite", ms: 450, click: true },
  { name: "invited", ms: 1600, point: "none" },
  { name: "inbox", ms: 900 },
  { name: "aimMail", ms: 800, point: "mail" },
  { name: "openMail", ms: 400, click: true },
  { name: "opened", ms: 1200 },
  { name: "aimOpenInvite", ms: 800, point: "openInvite" },
  { name: "openInvite", ms: 500, click: true },
  { name: "rest", ms: 600 },
]

// The steps that type a text of the page's language, a letter each, and the text each types.
const TYPED: Record<string, (content: CreateContent) => string> = {
  renaming: (content) => content.renamed,
  adding: (content) => content.subtopicAdded,
  asking: (content) => content.change,
}

/** The steps with each typed text's length from `content` (in the page's language). Every step
 * keeps its place, so the places below hold whatever the language. */
export function createSteps(content: CreateContent): DemoStep[] {
  return STEPS.map((step) =>
    step.name in TYPED
      ? { ...step, repeat: TYPED[step.name](content).length }
      : step
  )
}

// The steps the invite dialog is open for.
export const INVITING = [
  "aimEmail",
  "focusEmail",
  "typingEmail",
  "aimInviteName",
  "focusInviteName",
  "typingName",
  "aimSendInvite",
  "sendInvite",
]

// What the pointer moves to, by name (`data-demo-target`).
export const TARGETS = [
  "field",
  "paste",
  "send",
  "newCompany",
  "name",
  "continue",
  "edit",
  "subtopic",
  "ask",
  "apply",
  "go",
  "limit0",
  "limit1",
  "settingsTab",
  "seconds",
  "backLink",
  "invite",
  "email",
  "inviteName",
  "sendInvite",
  "mail",
  "openInvite",
]

export const APPLIED = stepIndex(STEPS, "applied")
export const WRITING = stepIndex(STEPS, "writing")
export const READY = stepIndex(STEPS, "ready")
// The interview's settings tab is open from its click until the topics tab is clicked back.
export const SETTINGS_OPEN = stepIndex(STEPS, "settings")
export const SETTINGS_CLOSED = stepIndex(STEPS, "aimInvite")
export const SECONDS_TYPED = stepIndex(STEPS, "typingSeconds")
export const INBOX = stepIndex(STEPS, "inbox")
export const OPENED = stepIndex(STEPS, "opened")
export const PASTED = stepIndex(STEPS, "pasted")
export const CHOOSING = stepIndex(STEPS, "company")
export const TOPICS = stepIndex(STEPS, "sent")
export const EDITED = stepIndex(STEPS, "edited")
