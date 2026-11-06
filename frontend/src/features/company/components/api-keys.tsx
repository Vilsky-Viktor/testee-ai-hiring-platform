"use client"

import { cn } from "cn"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { CodeEditor } from "@/components/common/code-editor"
import { InfoCard } from "@/components/common/warning-card"
import { Badge } from "@/components/ui/badge"
import { CARD } from "@/config/cards"
import { MAX_KEY_NAME } from "@/config/api"
import { LIST_BOX, ROW_HOVER } from "@/config/lists"
import { WARNING_TONE } from "@/config/tones"
import { CreateDialog } from "@/features/company/components/api-dialogs"
import { RemoveButton } from "@/features/company/components/api-remove-button"
import { KeyAccess } from "@/features/company/components/api-permissions"
import { DotsMenu } from "@/components/common/dots-menu"
import { useLocalTime } from "@/hooks/use-local-time"
import { bdi } from "@/lib/bidi"
import { hasMessage } from "@/lib/messages"
import { useOrigin } from "@/lib/origin"
import type { ApiKey, PermissionOptions } from "@/types/api-access"

/** What a key is, on its own two lines. */
function KeysNote() {
  const t = useTranslations("api")

  return (
    <InfoCard className="whitespace-pre-line max-sm:-mx-6 max-sm:rounded-none">
      {t("keysText")}
    </InfoCard>
  )
}

/** A one-line request to try a key with, to copy. */
function KeyExample({ apiKey }: { apiKey: string }) {
  const t = useTranslations("api")
  const origin = useOrigin()

  return (
    <div className="space-y-2" data-testid="key-example">
      <p className="text-sm text-muted-foreground">{t("exampleText")}</p>
      <CodeEditor
        code={`curl ${origin}/api/v1/credits \\\n  -H "Authorization: Bearer ${apiKey}"`}
        language="bash"
      />
    </div>
  )
}

/** "New key": a name, when it expires and what it may do, then the key itself, shown this once,
 * with a request to try it. With `copyOf`, a replacement for that key: its name and permissions
 * filled in, and `label` on the button. */
export function NewKey({
  companyId,
  expiries,
  options,
  defaults,
  triggerClassName,
  copyOf,
  label,
}: {
  companyId: string
  expiries: string[]
  options: PermissionOptions
  defaults: string[]
  triggerClassName?: string
  copyOf?: ApiKey
  label?: string
}) {
  const t = useTranslations("api")

  return (
    <CreateDialog
      path={`/v1/manage/keys?company_id=${companyId}`}
      field="name"
      maxLength={MAX_KEY_NAME}
      label={label ?? t("newKey")}
      initialValue={copyOf?.name}
      placeholder={t("keyName")}
      title={t("newKeyTitle")}
      failed={t("createFailed")}
      triggerClassName={triggerClassName}
      choice={{
        field: "expiry",
        label: t("expiresIn"),
        options: expiries.map((expiry) => {
          const key = `expiries.${expiry}` as const

          return { value: expiry, label: hasMessage(t, key) ? t(key) : expiry }
        }),
        warning: { value: "never", text: t("neverWarning") },
      }}
      ticks={{
        field: "permissions",
        initial: copyOf?.permissions ?? defaults,
        render: (ticked, onChange) => (
          <KeyAccess
            options={options}
            ticked={ticked}
            onChange={onChange}
            initial={copyOf?.access}
          />
        ),
      }}
      shown={{
        value: "key",
        title: t("keyCreatedTitle"),
        text: t("keyCreatedText"),
        copy: t("copyKey"),
        copied: t("keyCopied"),
        after: (value) => <KeyExample apiKey={value} />,
      }}
    />
  )
}

/** How a key stands, as a pill; amber when it needs attention. */
export function KeyState({ apiKey }: { apiKey: ApiKey }) {
  const t = useTranslations("api")
  const warned = apiKey.state === "expired" || apiKey.state === "expiring"

  return (
    <Badge
      variant="outline"
      className={cn(
        "h-8 px-4 text-sm font-light max-sm:order-3",
        warned && WARNING_TONE
      )}
    >
      {t(`states.${apiKey.state}`)}
    </Badge>
  )
}

/** A key's "⋮" menu: deleting it. */
export function KeyMenu({
  companyId,
  apiKey,
}: {
  companyId: string
  apiKey: ApiKey
}) {
  const t = useTranslations("api")
  const [removing, setRemoving] = useState(false)

  return (
    <>
      <DotsMenu
        items={[
          {
            label: t("removeKey"),
            onClick: () => setRemoving(true),
            destructive: true,
          },
        ]}
      />
      <RemoveButton
        path={`/v1/manage/keys/${apiKey.id}?company_id=${companyId}`}
        label={t("removeKey")}
        title={t("removeKeyTitle")}
        text={t.rich("removeKeyText", { name: apiKey.name, ...bdi })}
        failed={t("removeFailed")}
        opened={removing}
        onOpenedChange={setRemoving}
      />
    </>
  )
}

/** A key's row: its name and first characters, when it was last used, what it may do, how it
 * stands, and its "⋮" menu for those who can delete it. The row opens the key's page. */
function KeyRow({
  companyId,
  apiKey,
  canEdit,
}: {
  companyId: string
  apiKey: ApiKey
  canEdit: boolean
}) {
  const t = useTranslations("api")
  const localTime = useLocalTime()

  return (
    <li
      className={`group/row relative flex flex-wrap items-center gap-x-6 gap-y-3 p-6 ${ROW_HOVER}`}
      data-testid="api-key"
      data-state={apiKey.state}
    >
      {/* On phones the name's line ends with the "⋮"; what it may do and how it stands go under. */}
      <span className="min-w-0 flex-1 space-y-1 max-sm:basis-[calc(100%-4rem)]">
        <span className="flex flex-wrap items-center gap-x-3">
          <Link
            href={`/companies/${companyId}/integrations/api/keys/${apiKey.id}`}
            className="text-lg font-medium break-all outline-none after:absolute after:inset-0 focus-visible:after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
          >
            {apiKey.name}
          </Link>
          <code className="text-sm text-muted-foreground">{apiKey.shown}…</code>
        </span>
        <span className="block text-sm text-muted-foreground">
          {apiKey.last_used_at
            ? t.rich("lastUsed", localTime.dateValues(apiKey.last_used_at))
            : t("neverUsed")}
        </span>
      </span>
      <span
        className="text-sm text-muted-foreground max-sm:order-2"
        data-testid="key-access"
      >
        {t(`access.${apiKey.access}`)}
      </span>
      <KeyState apiKey={apiKey} />
      {canEdit && (
        <span className="relative z-10 flex max-sm:order-1">
          <KeyMenu companyId={companyId} apiKey={apiKey} />
        </span>
      )}
    </li>
  )
}

/** The company's API keys, those needing attention first; with none yet, what a key is for, a
 * request to try one with and the way to make the first. */
export function ApiKeys({
  companyId,
  keys,
  expiries,
  options,
  defaults,
  canEdit,
}: {
  companyId: string
  keys: ApiKey[]
  expiries: string[]
  options: PermissionOptions
  defaults: string[]
  canEdit: boolean
}) {
  const t = useTranslations("api")

  if (keys.length === 0) {
    return (
      <div className="space-y-6">
        <KeysNote />
        <section
          className={`mx-auto max-w-xl space-y-6 ${CARD}`}
          data-testid="no-keys"
        >
          <h2 className="font-heading text-2xl font-medium tracking-tight">
            {t("firstKeyTitle")}
          </h2>
          <KeyExample apiKey="te_..." />
          {canEdit && (
            <NewKey
              companyId={companyId}
              expiries={expiries}
              options={options}
              defaults={defaults}
              triggerClassName="h-14 w-full text-lg"
            />
          )}
        </section>
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <KeysNote />
      <ul className={LIST_BOX}>
        {keys.map((key) => (
          <KeyRow
            key={key.id}
            companyId={companyId}
            apiKey={key}
            canEdit={canEdit}
          />
        ))}
      </ul>
    </section>
  )
}
