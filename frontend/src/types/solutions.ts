import type en from "../../messages/en.json"

// The solution pages' message keys, so their config names only texts that exist.
type Texts = (typeof en)["solutions"]

export type SolutionId = keyof Texts["pages"]
export type SolutionRowKey = keyof Texts["rows"]
export type SolutionPointKey = keyof Texts["points"]
export type SolutionCardKey = keyof Texts["cards"]
export type SolutionMoreKey = keyof Texts["more"]
