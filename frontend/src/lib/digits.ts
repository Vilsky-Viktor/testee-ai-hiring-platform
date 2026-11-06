// The digits a phone keyboard may type in the site's languages besides 0 to 9, each from zero.
const LOCAL_DIGITS = ["٠١٢٣٤٥٦٧٨٩", "۰۱۲۳۴۵۶۷۸۹", "०१२३४५६७८९", "๐๑๒๓๔๕๖๗๘๙"]

/** The digits in `typed`, written 0 to 9, whichever script they were typed in; all else dropped. */
export function onlyDigits(typed: string) {
  const latin = LOCAL_DIGITS.reduce(
    (text, digits) =>
      [...digits].reduce(
        (result, digit, value) => result.replaceAll(digit, String(value)),
        text
      ),
    typed
  )

  return latin.replace(/\D/g, "")
}
