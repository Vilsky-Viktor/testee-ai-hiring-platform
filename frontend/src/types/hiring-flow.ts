import type en from "../../messages/en.json"

// The hiring flow page's message keys, so its config names only stages that exist.
type Stages = (typeof en)["hiringFlow"]["stages"]

export type FlowStageKey = keyof Stages
