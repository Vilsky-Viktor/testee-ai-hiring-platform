"use client"

import { type ComponentProps, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"

import { Chips } from "@/components/common/ats-steps"
import { CodeEditor } from "@/components/common/code-editor"
import { PillChoice } from "@/components/common/pill-choice"
import { CopyValue } from "@/components/common/copy-field"
import { InstructionsDialog } from "@/components/common/instructions-dialog"
import { KeepAcronyms } from "@/components/common/keep-acronyms"
import {
  CHATGPT_AUTH,
  CHATGPT_CREATE,
  CHATGPT_DEVELOPER_PATH,
  CLAUDE_CONNECTOR_PATH,
  MCP_DOCS_PATH,
  MCP_NAME,
  MCP_PATH,
} from "@/config/ai-apps"
import { useOrigin } from "@/lib/origin"

// The apps with their own steps on the AI apps page; products' names stay as they are.
const SETUP_APPS = [
  { id: "claude", name: "Claude" },
  { id: "chatgpt", name: "ChatGPT" },
  { id: "code", name: "Claude Code" },
  { id: "others", name: null },
] as const

type SetupApp = (typeof SETUP_APPS)[number]["id"]

/** The MCP server's Instructions button, on its row and its page, like the other integrations':
 * a dialog with the server's address and the apps' steps, and a link to the developer docs for other apps and one's
 * own agents. */
export function AiAppsInstructions(
  props: Pick<
    ComponentProps<typeof InstructionsDialog>,
    "open" | "onOpenChange" | "noButton"
  >
) {
  const t = useTranslations("aiApps")

  return (
    <InstructionsDialog {...props} title={t("instructionsTitle")}>
      <ServerAddress />
      <AppSteps />
      <p className="text-base text-muted-foreground">
        {t.rich("moreApps", {
          link: (chunks) => (
            <Link
              href={MCP_DOCS_PATH}
              className="text-foreground underline underline-offset-4"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>
    </InstructionsDialog>
  )
}

/** The server's address to copy: in the dialog and on the developer docs' MCP tab. */
export function ServerAddress() {
  const t = useTranslations("aiApps")
  const ats = useTranslations("ats")
  const origin = useOrigin()

  return (
    <SetupSection title={t("serverTitle")} text={t("serverText")}>
      <CopyValue
        value={origin ? `${origin}${MCP_PATH}` : ""}
        label={ats("copyUrl")}
        copied={ats("copied")}
      />
    </SetupSection>
  )
}

/** Claude's steps and ChatGPT's, each under its title: in the dialog. */
export function AppSteps() {
  const t = useTranslations("aiApps")

  return (
    <>
      <SetupSection title={t.rich("addTo", { name: "Claude", app: KeepCase })}>
        <ClaudeSteps />
      </SetupSection>
      <SetupSection title={t.rich("addTo", { name: "ChatGPT", app: KeepCase })}>
        <ChatGptSteps />
      </SetupSection>
    </>
  )
}

/** The command that adds it to Claude Code. */
function useClaudeCommand() {
  const origin = useOrigin()

  return origin
    ? `claude mcp add --transport http ${MCP_NAME} ${origin}${MCP_PATH}`
    : ""
}

/** The steps in Claude's own app. */
function ClaudeAppSteps() {
  const t = useTranslations("aiApps")

  return (
    <ol className="list-decimal space-y-3 ps-5 text-base text-muted-foreground">
      <li className="space-y-1.5">
        <span className="block">{t("claudeOpen")}</span>
        <Chips items={CLAUDE_CONNECTOR_PATH} path />
      </li>
      <li>{t("claudePaste", { name: MCP_NAME })}</li>
      <li>{t("allowOnTestee")}</li>
    </ol>
  )
}

/** Connecting an app, on the AI apps page: the server's address, then the steps of the app
 * chosen. */
export function AiAppsSetup() {
  const t = useTranslations("aiApps")
  const command = useClaudeCommand()
  const [app, setApp] = useState<SetupApp>("claude")

  return (
    <section className="space-y-6" data-testid="ai-apps-setup">
      <h2 className="font-heading text-2xl font-medium">
        <KeepAcronyms text={t("instructionsTitle")} />
      </h2>
      <ServerAddress />
      <PillChoice
        testId="ai-app-choice"
        keepCase
        options={SETUP_APPS.map(({ id, name }) => ({
          value: id,
          label: name ?? t("otherApps"),
        }))}
        value={app}
        onChange={setApp}
      />
      {app === "claude" && <ClaudeAppSteps />}
      {app === "chatgpt" && <ChatGptSteps />}
      {app === "code" && <CodeEditor code={command} language="bash" />}
      {app === "others" && <MoreApps />}
    </section>
  )
}

/** Where the other apps' steps are. */
function MoreApps() {
  const t = useTranslations("aiApps")

  return (
    <p className="text-base text-muted-foreground">
      {t.rich("moreApps", {
        link: (chunks) => (
          <Link href={MCP_DOCS_PATH} className="font-medium text-foreground">
            {chunks}
          </Link>
        ),
      })}
    </p>
  )
}

/** Claude's steps and Claude Code's one command, in the ATS steps' style: in the dialog and on
 * the developer docs' MCP tab. */
export function ClaudeSteps() {
  const t = useTranslations("aiApps")
  const command = useClaudeCommand()

  return (
    <>
      <ClaudeAppSteps />
      <div className="space-y-2">
        <p className="text-base text-muted-foreground">{t("claudeCode")}</p>
        <CopyValue
          value={command}
          label={t("copyCommand")}
          copied={t("commandCopied")}
        />
      </div>
    </>
  )
}

/** ChatGPT's steps: in the dialog and on the developer docs' MCP tab. */
export function ChatGptSteps() {
  const t = useTranslations("aiApps")

  return (
    <ol className="list-decimal space-y-3 ps-5 text-base text-muted-foreground">
      <li className="space-y-1.5">
        <span className="block">{t("chatgptDeveloper")}</span>
        <Chips items={CHATGPT_DEVELOPER_PATH} path />
      </li>
      <li className="space-y-1.5">
        <span className="block">{t("chatgptCreate")}</span>
        <Chips items={[CHATGPT_CREATE]} />
      </li>
      <li className="space-y-1.5">
        <span className="block">{t("chatgptPaste", { name: MCP_NAME })}</span>
        <Chips items={[CHATGPT_AUTH]} />
      </li>
      <li>{t("allowOnTestee")}</li>
    </ol>
  )
}

/** A part of the setup: its title, what it's for when there's more to say, then its content.
 * The developer docs' other apps use it too. */
export function SetupSection({
  title,
  text,
  children,
}: {
  title: React.ReactNode
  text?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-medium">{title}</h3>
        {text && <p className="text-base text-muted-foreground">{text}</p>}
      </div>
      {children}
    </section>
  )
}

/** An app's name in a lowercase title, keeping its own capitals. */
function KeepCase(chunks: React.ReactNode) {
  return <span className="normal-case">{chunks}</span>
}
