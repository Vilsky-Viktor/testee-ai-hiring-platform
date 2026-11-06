/** The home page's job description box: the page's first text box. */
export function startBox() {
  return document.querySelector("textarea")
}

/** Back up to the home page's job description box, ready to type. */
export function goToStart() {
  window.scrollTo({ top: 0, behavior: "smooth" })
  startBox()?.focus({ preventScroll: true })
}
