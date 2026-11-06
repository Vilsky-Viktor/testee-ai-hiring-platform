"use client"

import { useEffect } from "react"

// What counts as clickable: buttons, links, the controls built as them, and fields.
const CLICKABLE = [
  "input:not(:disabled):not([type=hidden])",
  "textarea:not(:disabled)",
  "select:not(:disabled)",
  "button:not(:disabled)",
  "a[href]",
  '[role="button"]:not([aria-disabled="true"])',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="radio"]',
  '[role="checkbox"]',
  '[role="switch"]',
].join(",")
// How long the jump plays (`jump`, animations.css), in milliseconds.
const JUMP_MS = 450

/** What jumps for `pressed`: itself, or for a field drawn by the box around it (a see-through
 * input filling the site's grey box, FloatingInput), that box. */
function shownBox(pressed: Element) {
  const field = pressed.matches("input, textarea, select")
  const clear = getComputedStyle(pressed).backgroundColor === "rgba(0, 0, 0, 0)"

  return field && clear && pressed.parentElement
    ? pressed.parentElement
    : pressed
}

/** The row a stretched link fills: what its ::after is placed against; none when that's the page
 * itself, which mustn't jump. */
function rowOf(link: Element) {
  const row = (link as HTMLElement).offsetParent

  return row && row !== document.body ? row : null
}

/** Every clickable thing on the site, fields too, jumps as it's pressed, as the landing's promos
 * show clicks: marked `data-jumping` for the jump's length (animations.css; nothing with reduced
 * motion). Renders nothing. */
export function ClickJump() {
  useEffect(() => {
    const timers = new Map<Element, number>()

    // Plays the jump on `target`; pressed again mid-jump, it starts over.
    function jump(target: Element) {
      window.clearTimeout(timers.get(target))
      target.removeAttribute("data-jumping")
      void (target as HTMLElement).offsetWidth
      target.setAttribute("data-jumping", "")
      timers.set(
        target,
        window.setTimeout(() => {
          target.removeAttribute("data-jumping")
          timers.delete(target)
        }, JUMP_MS)
      )
    }

    function onPress(event: PointerEvent) {
      const target = event.target as Element | null
      // A control's label presses the control.
      const pressed =
        target?.closest(CLICKABLE) ??
        target?.closest("label")?.querySelector(CLICKABLE)

      if (!pressed) {
        return
      }

      // A button opening a menu or popup keeps its box still, as the popup is placed by it:
      // what's inside it jumps (its icon, its picture). A dialog sits apart from its button, and
      // a field's list opens only once typed in: those jump as any other.
      const opensPopup =
        pressed.hasAttribute("aria-haspopup") &&
        pressed.getAttribute("aria-haspopup") !== "dialog" &&
        !pressed.matches("input, textarea, select")
      // A link or button stretched over its row by an absolute ::after: a transform on it would
      // shrink that area to its own box, and the release would miss it, losing the click. The row
      // the area fills jumps instead, area and all. A checkbox's or a switch's ::after is only its
      // larger touch area: those jump by themselves.
      const stretched =
        !pressed.matches('[role="checkbox"], [role="switch"]') &&
        getComputedStyle(pressed, "::after").position === "absolute"
      const row = stretched ? rowOf(pressed) : null
      const targets = row
        ? [row]
        : opensPopup
          ? [...pressed.children]
          : [shownBox(pressed)]
      targets.forEach(jump)
    }

    document.addEventListener("pointerdown", onPress, true)

    return () => {
      document.removeEventListener("pointerdown", onPress, true)
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  return null
}
