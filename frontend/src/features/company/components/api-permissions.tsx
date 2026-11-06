"use client"

import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Fragment, useState } from "react"
import { toast } from "sonner"

import { SavedCheck } from "@/components/common/saved-check"
import { PillChoice } from "@/components/common/pill-choice"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useSavedMark } from "@/hooks/use-saved-mark"
import { apiErrorMessage, apiFetch, serviceRefusal } from "@/lib/api"
import { lockedReads, permissionsByGroup, tick } from "@/lib/api-permissions"
import { hasMessage } from "@/lib/messages"
import type { ApiKey, PermissionOptions } from "@/types/api-access"
import { CARD } from "@/config/cards"

// The sizes of the email preferences' checkboxes: "Select all" like the digest, the rest like
// its kinds. A checkbox that can't change fades with its text, as a disabled switch does.
const LABEL =
  "flex cursor-pointer items-center has-data-disabled:cursor-not-allowed has-data-disabled:opacity-50"
const BIG = "size-7 shrink-0 [&_[data-slot=checkbox-indicator]>svg]:size-5"
const SMALL = "size-6 shrink-0 [&_[data-slot=checkbox-indicator]>svg]:size-4"

// A group or a permission from the API by its name in `group`, or as it is when there's none.
function named(
  t: ReturnType<typeof useTranslations<"api">>,
  group: "permissionGroups" | "permissions" | "permissionLine",
  value: string
) {
  const key = `${group}.${value}` as const

  return hasMessage(t, key) ? t(key) : value
}

/** A key's permissions as checkboxes, laid out like the email preferences' digest: "Select all"
 * (a dash when only some are ticked), then each group's permissions under its name. A read that
 * a ticked permission comes with stays ticked. */
export function PermissionTicks({
  options,
  ticked,
  onChange,
  disabled = false,
}: {
  options: PermissionOptions
  ticked: string[]
  onChange: (ticked: string[]) => void
  disabled?: boolean
}) {
  const t = useTranslations("api")
  const all = Object.values(options.permission_groups).flat()
  const locked = lockedReads(ticked, options.implied)
  const on = all.filter((item) => ticked.includes(item)).length

  function change(permission: string, checked: boolean) {
    onChange(
      checked
        ? tick(ticked, permission, options.implied)
        : ticked.filter((item) => item !== permission)
    )
  }

  return (
    <div className={`space-y-4 ${CARD}`}>
      {/* Set apart from the groups by a line. */}
      <label className={`${LABEL} gap-4 border-b pb-4`}>
        <Checkbox
          className={BIG}
          checked={on === all.length}
          indeterminate={on > 0 && on < all.length}
          disabled={disabled}
          onCheckedChange={(checked) => onChange(checked ? all : [])}
        />
        <span className="text-lg font-light">{t("selectAll")}</span>
      </label>
      <div className="space-y-4">
        {Object.entries(options.permission_groups).map(([group, items]) => (
          <fieldset key={group} className="space-y-2">
            <legend className="text-base">
              {named(t, "permissionGroups", group)}
            </legend>
            {/* Two columns on phones; a group's only permission takes the whole row. */}
            <div
              className={
                items.length === 1
                  ? "flex"
                  : "grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:flex-wrap"
              }
            >
              {items.map((permission) => (
                <label
                  key={permission}
                  className={`${LABEL} gap-3 text-base font-light text-muted-foreground`}
                >
                  <Checkbox
                    className={SMALL}
                    checked={
                      ticked.includes(permission) || locked.has(permission)
                    }
                    disabled={disabled || locked.has(permission)}
                    onCheckedChange={(checked) => change(permission, checked)}
                  />
                  {named(t, "permissions", permission)}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </div>
  )
}

/** A key's permissions, one group a line: its name, then each permission as a small tag, all on
 * that line. */
export function PermissionTags({
  permissions,
  groups,
}: {
  permissions: string[]
  groups: Record<string, string[]>
}) {
  const t = useTranslations("api")

  return (
    <span
      className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2"
      data-testid="key-permissions"
    >
      {permissionsByGroup(permissions, groups).map((entry) => (
        <Fragment key={entry.group}>
          <span className="text-sm text-muted-foreground">
            {named(t, "permissionGroups", entry.group)}
          </span>
          <span className="flex gap-1.5">
            {entry.permissions.map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="h-7 px-3.5 text-xs font-light normal-case"
              >
                {named(t, "permissionLine", item)}
              </Badge>
            ))}
          </span>
        </Fragment>
      ))}
    </span>
  )
}

const PRESETS = ["read", "write"] as const
type Preset = (typeof PRESETS)[number] | "custom"

/** What a key may do: a preset, starting on `initial`, or Custom with every permission to tick. */
export function KeyAccess({
  options,
  ticked,
  onChange,
  initial = "read",
  disabled = false,
  saved,
}: {
  options: PermissionOptions
  ticked: string[]
  onChange: (ticked: string[]) => void
  initial?: Preset
  disabled?: boolean
  // SavedCheck's text, for permissions that save themselves.
  saved?: string | null
}) {
  const t = useTranslations("api")
  const [preset, setPreset] = useState<Preset>(initial)

  function choose(next: Preset) {
    setPreset(next)

    if (next !== "custom") {
      onChange(options.permission_presets[next])
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <PillChoice
          testId="key-presets"
          options={([...PRESETS, "custom"] as const).map((item) => ({
            value: item,
            label: t(`access.${item}`),
          }))}
          value={preset}
          onChange={choose}
          disabled={disabled}
        />
        <SavedCheck text={saved} />
      </div>
      {preset === "custom" && (
        <PermissionTicks
          options={options}
          ticked={ticked}
          onChange={onChange}
          disabled={disabled}
        />
      )}
    </div>
  )
}

/** A key's permissions on its page: a preset, or Custom with its checkboxes. Each change saves at
 * once, confirmed by a check; one the API refuses (unticking the last) is undone. */
export function KeyPermissions({
  companyId,
  apiKey,
  options,
}: {
  companyId: string
  apiKey: ApiKey
  options: PermissionOptions
}) {
  const t = useTranslations("api")
  const router = useRouter()
  const [ticked, setTicked] = useState(apiKey.permissions)
  const [saving, setSaving] = useState(false)
  const { markSaved, savedText } = useSavedMark()

  async function change(next: string[]) {
    const before = ticked
    setTicked(next)
    setSaving(true)

    try {
      await apiFetch(`/v1/manage/keys/${apiKey.id}?company_id=${companyId}`, {
        method: "PATCH",
        body: JSON.stringify({ permissions: next }),
      })
      markSaved()
      router.refresh()
    } catch (error) {
      setTicked(before)
      toast.error(
        serviceRefusal(error, [409]) ??
          apiErrorMessage(error, t("permissionsFailed"))
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <KeyAccess
      options={options}
      ticked={ticked}
      onChange={change}
      initial={apiKey.access}
      disabled={saving}
      saved={savedText()}
    />
  )
}
