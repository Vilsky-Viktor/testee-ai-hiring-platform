import { beforeEach, expect, it, vi } from "vitest"

import { useVoiceInterviewer } from "@/hooks/use-voice-interviewer"
import { liveListening } from "@/lib/voice-live"
import type { VoiceAnswer, VoiceHandlers } from "@/types/round"

// The hook runs on a small stand-in for React: tests here have no DOM, and what's checked is the
// order of events around a question change, not rendering.
const react = vi.hoisted(() => {
  let slots: { value: unknown; deps?: unknown[] }[] = []
  let cursor = 0
  let effects: (() => void)[] = []

  function slot(value: unknown) {
    slots[cursor] ??= { value }

    return slots[cursor++]
  }

  return {
    render<T>(hook: () => T) {
      cursor = 0
      effects = []
      const result = hook()
      effects.splice(0).forEach((effect) => effect())

      return result
    },
    reset() {
      slots = []
    },
    useRef: (value: unknown) => {
      const held = slot({ current: value })

      return held.value
    },
    useState: (value: unknown) => {
      const held = slot(value)

      return [held.value, (next: unknown) => (held.value = next)]
    },
    useEffect: (effect: () => void, deps?: unknown[]) => {
      const held = slot(null)
      const same = held.deps?.every((dep, index) => dep === deps?.[index])

      if (!same) {
        effects.push(effect)
      }

      held.deps = deps
    },
  }
})

const speech = vi.hoisted(() => ({
  listener: { pause: vi.fn(), resume: vi.fn(), flush: vi.fn(), stop: vi.fn() },
  handlers: {} as {
    onSpeechStart: () => void
    onSpeech: (audio: Blob, voicedMs: number) => void
  },
}))

vi.mock("react", () => react)
vi.mock("@/lib/api", () => ({ apiErrorMessage: () => "failed" }))
vi.mock("@/lib/voice-clips", () => ({
  prepareNextQuestion: vi.fn(),
  sayGoodbye: vi.fn(),
}))
vi.mock("@/lib/voice-kept-clips", () => ({
  keptClips: () => ({
    say: async () => undefined,
    preload: () => undefined,
    release: () => undefined,
  }),
  savedClip: () => "",
  savedClips: () => [],
}))
vi.mock("@/lib/voice-acknowledgement", () => ({
  acknowledgement: () => ({ schedule: vi.fn(), cancel: vi.fn() }),
}))
vi.mock("@/lib/voice-meters", () => ({
  meters: () => null,
  soundAllowed: async () => true,
}))
vi.mock("@/lib/voice-listening", () => ({
  openMicrophone: async () => ({ getTracks: () => [] }),
  listen: async (
    _mic: unknown,
    _type: string,
    _detector: unknown,
    handlers: typeof speech.handlers
  ) => {
    speech.handlers = handlers

    return speech.listener
  },
}))
vi.mock("@/lib/voice-live", () => ({ liveListening: vi.fn() }))
vi.mock("@/lib/voice-timing", () => ({
  turnTiming: () => ({
    ended: vi.fn(),
    answered: vi.fn(),
    dropped: vi.fn(),
    reacted: vi.fn(),
  }),
}))
vi.mock("@/lib/voice-vad", () => ({ micDetector: () => null }))
vi.mock("@/lib/voice", () => ({ recordingType: () => "audio/webm" }))

const CLEAR_B: VoiceAnswer = {
  heard: "B",
  intent: "choose",
  picks: [1],
  clear: true,
  doubted: false,
}

let answered: (reply: { answer: VoiceAnswer; stages: object }) => void
let failed: (error: Error) => void

function handlers() {
  return {
    onPick: vi.fn(),
    onSave: vi.fn(async () => true),
    onConfirm: vi.fn(async () => true),
    failedMessage: "failed",
  } as unknown as VoiceHandlers
}

function render(question: string, on: VoiceHandlers) {
  return react.render(() => useVoiceInterviewer("s1", question, [], 4, on))
}

/** Voice mode running on `q1`, the candidate having spoken, the answer still being understood. */
async function speaking(on: VoiceHandlers) {
  const hook = render("q1", on)
  await hook.start()
  render("q1", on)
  speech.handlers.onSpeechStart()
  speech.handlers.onSpeech(new Blob(["sound"]), 800)

  return hook
}

const settled = () => new Promise((done) => setTimeout(done, 0))

beforeEach(() => {
  react.reset()
  vi.clearAllMocks()
  vi.stubGlobal("window", globalThis)
  vi.stubGlobal(
    "AudioContext",
    class {
      close = async () => undefined
    }
  )
  vi.stubGlobal(
    "Audio",
    class {
      pause = () => undefined
    }
  )
  vi.mocked(liveListening).mockReturnValue({
    answer: () =>
      new Promise((resolve, reject) => {
        answered = (reply) => resolve({ ...reply, live: true } as never)
        failed = reject
      }),
  } as never)
})

it("acts on an answer to the question still on screen", async () => {
  const on = handlers()
  await speaking(on)

  answered({ answer: CLEAR_B, stages: {} })
  await settled()

  expect(on.onPick).toHaveBeenCalledWith("q1", [1])
  expect(on.onSave).toHaveBeenCalledWith([1])
})

it.each([
  ["the time ran out and the hold ended", true],
  ["the screen moved on", false],
])("drops an answer that arrives after: %s", async (_, timedOut) => {
  const on = handlers()
  const hook = await speaking(on)

  if (timedOut) {
    void hook.timeUp()
  }

  render("q2", on)
  await settled()

  answered({ answer: CLEAR_B, stages: {} })
  await settled()

  expect(on.onPick).not.toHaveBeenCalled()
  expect(on.onSave).not.toHaveBeenCalled()
})

it("keeps a late failure off the next question", async () => {
  const on = handlers()
  await speaking(on)
  render("q2", on)
  await settled()
  speech.listener.resume.mockClear()

  failed(new Error("refused"))
  await settled()

  expect(render("q2", on).problem).toBeNull()
  // Mira is reading the next question: the microphone stays off until she's done.
  expect(speech.listener.resume).not.toHaveBeenCalled()
})
