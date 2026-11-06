import { ChevronDownIcon } from "lucide-react"
import { notFound } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"

import { DocSection } from "@/features/api-docs/components/doc-section"
import { Fields } from "@/features/api-docs/components/fields"
import { OpenHash } from "@/features/api-docs/components/open-hash"
import {
  McpAgents,
  McpApp,
  McpTab,
  McpToolList,
} from "@/features/api-docs/components/mcp-tab"
import { Operation } from "@/features/api-docs/components/operation"
import { RichText } from "@/features/api-docs/components/rich-text"
import { CopyValue } from "@/components/common/copy-field"
import { DocsMenu } from "@/features/api-docs/components/docs-menu"
import { JsonLd } from "@/components/common/json-ld"
import { API_PAGES, DOC_TABS } from "@/config/api-docs"
import { DEFAULT_LOCALE } from "@/config/i18n"
import { LIST_BOX, ROW_HOVER, ROW_ICON } from "@/config/lists"
import { MCP_APP_PAGES, MCP_SUB_PAGES, MCP_TOOLS_PATH } from "@/config/mcp-docs"
import { mcpExamples } from "@/lib/mcp-examples"
import {
  descriptionTabs,
  fieldsOf,
  operationGroups,
  operationsOf,
  schemasOf,
} from "@/lib/openapi"
import { publicFetch } from "@/lib/server-api"
import { pageMetadata, previewImage, siteUrl } from "@/lib/site"
import { breadcrumbData, techArticleData } from "@/lib/structured-data"
import type { McpTools } from "@/types/mcp"
import type { OpenApi } from "@/types/openapi"
import { PageKey } from "@/components/common/page-key"

export async function generateMetadata() {
  const t = await getTranslations("apiDocs")

  return pageMetadata(t("title"), t("description"), "/api-docs")
}

/** The developer docs, read from the API's own description, so they always match it: a tab for
 * the API (how to sign in, its routes), its web hooks, the SDK that embeds the interview, the
 * MCP server (its tools and limits read from the server; its longer parts and each AI app's
 * setup pages of its own, `page`), and the objects they return. English only, like the legal pages. */
export default async function ApiDocsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>
}) {
  const t = await getTranslations("apiDocs")
  const locale = await getLocale()
  const { tab, page: asked } = await searchParams
  const current = DOC_TABS.find((item) => item === tab) ?? "api"
  // A page of the MCP tab; any other address on it is the tab's overview.
  const mcpPage = MCP_SUB_PAGES.find(
    (item) => current === "mcp" && item.id === asked
  )?.id
  // A page of the API tab; any other address on it is the first.
  const apiPage =
    API_PAGES.find((item) => current === "api" && item.id === asked) ??
    API_PAGES[0]
  const spec = await publicFetch<OpenApi>("/v1/openapi.json", { locale: "en" })

  if (!spec) {
    notFound()
  }

  const texts = descriptionTabs(spec.info.description ?? "")
  // The MCP tab's own pages: its overview, then the rest, the apps by their own names.
  const mcpPages = [
    {
      id: "overview",
      href: "/api-docs?tab=mcp",
      label: t("mcpPages.overview"),
    },
    ...MCP_SUB_PAGES.map((page) => ({
      ...page,
      label: "label" in page ? page.label : t(`mcpPages.${page.id}`),
    })),
  ]
  const apiPages = API_PAGES.map((item, index) => ({
    id: item.id,
    href: index ? `/api-docs?page=${item.id}` : "/api-docs",
    label: t(`apiPages.${item.id}`),
  }))
  const tabs = DOC_TABS.map((id) => ({
    id,
    href: id === "api" ? "/api-docs" : `/api-docs?tab=${id}`,
    label: id === "objects" ? t("objects") : t(`tabs.${id}`),
    // Acronyms keep their capitals in the lowercase tabs.
    keepCase: id === "api" || id === "sdk" || id === "mcp",
    sub: { api: apiPages, mcp: mcpPages }[id as string],
  }))

  const site = siteUrl()

  return (
    <main className="mx-auto max-w-page space-y-8 px-6 py-12">
      <PageKey page="apiDocs" />
      <JsonLd
        data={[
          techArticleData(site, {
            title: t("title"),
            description: t("description"),
            path: "/api-docs",
            image: previewImage(t("title"))[0].url,
          }),
          breadcrumbData(site, [
            { name: "testee", path: "/" },
            { name: t("title"), path: "/api-docs" },
          ]),
        ]}
      />
      <header className="space-y-2">
        <h1 className="font-heading text-3xl font-medium tracking-tight">
          {t("title")}
        </h1>
        <p className="max-w-4xl text-base text-muted-foreground">
          {t("intro")}
        </p>
        {locale !== DEFAULT_LOCALE && (
          <p className="text-sm text-muted-foreground">{t("englishOnly")}</p>
        )}
      </header>
      <DocsMenu
        tabs={tabs}
        current={current}
        currentSub={current === "api" ? apiPage.id : (mcpPage ?? "overview")}
      >
        <div lang="en" dir="ltr" className="space-y-10">
          {current === "api" && (
            <ApiTab spec={spec} text={texts.api} page={apiPage} />
          )}
          {current === "webhooks" && (
            <WebhooksTab spec={spec} text={texts.webhooks} />
          )}
          {current === "sdk" && texts.sdk && <RichText text={texts.sdk} />}
          {current === "mcp" && <McpPage page={mcpPage} site={site} />}
          {current === "objects" && <ObjectsTab spec={spec} />}
        </div>
      </DocsMenu>
    </main>
  )
}

/** The MCP tab's open page: the example agents, an AI app's setup, or a page with what it shows
 * from the server (the tools, or the overview with the limits in its rules). */
async function McpPage({ page, site }: { page?: string; site: string }) {
  if (page === "frameworks") {
    return <McpAgents examples={await mcpExamples()} />
  }

  if (MCP_APP_PAGES.some((item) => item.id === page)) {
    return <McpApp site={site} app={page ?? ""} />
  }

  const tools = await publicFetch<McpTools>(MCP_TOOLS_PATH, { locale: "en" })

  if (page === "tools") {
    return tools && <McpToolList tools={tools} />
  }

  return <McpTab tools={tools} />
}

/** The API tab's open page: sections of the description, the first with the base URL, or every
 * route by what it's about. */
async function ApiTab({
  spec,
  text,
  page,
}: {
  spec: OpenApi
  text?: string
  page: (typeof API_PAGES)[number]
}) {
  const t = await getTranslations("apiDocs")

  if (page.id === "endpoints") {
    return (
      <>
        <p className="max-w-4xl text-base leading-relaxed text-muted-foreground">
          {t("endpointsText")}
        </p>
        <DocSection title={t("baseUrl")}>
          <CopyValue
            value={spec.servers?.[0]?.url ?? ""}
            label={t("copyBaseUrl")}
            copied={t("baseUrlCopied")}
          />
        </DocSection>
        <OperationGroups spec={spec} paths={spec.paths} />
      </>
    )
  }

  return text ? <RichText text={text} only={page.sections} /> : null
}

/** Routes or web hooks by what they're about, each group one list. */
function OperationGroups({
  spec,
  paths,
}: {
  spec: OpenApi
  paths: OpenApi["paths"]
}) {
  return operationGroups(paths).map(([tag, items]) => (
    <DocSection key={tag} title={tag}>
      <div className={`${LIST_BOX} overflow-hidden`}>
        {items.map((item) => (
          <Operation
            key={`${item.method} ${item.path}`}
            spec={spec}
            {...item}
          />
        ))}
      </div>
    </DocSection>
  ))
}

/** The objects the API returns, each opening to its fields; a type's link opens its object. */
function ObjectsTab({ spec }: { spec: OpenApi }) {
  return (
    <div className={`${LIST_BOX} overflow-hidden`}>
      <OpenHash />
      {schemasOf(spec).map(([name, schema]) => (
        <details
          key={name}
          id={name}
          data-testid="doc-object"
          className="group/details scroll-mt-24"
        >
          <summary
            className={`group/row flex cursor-pointer list-none items-center gap-4 p-4 sm:px-6 ${ROW_HOVER} [&::-webkit-details-marker]:hidden`}
          >
            <code className="min-w-0 flex-1 font-mono text-base font-medium">
              {name}
            </code>
            <span aria-hidden className={`${ROW_ICON} size-8`}>
              <ChevronDownIcon className="size-4 transition-transform group-open/details:rotate-180" />
            </span>
          </summary>
          <div className="space-y-4 border-t p-4 sm:p-6">
            {schema.description && <RichText text={schema.description} />}
            <Fields fields={fieldsOf(spec, schema)} />
          </div>
        </details>
      ))}
    </div>
  )
}

/** The web hooks tab: the description's text and each web hook. */
async function WebhooksTab({ spec, text }: { spec: OpenApi; text?: string }) {
  const t = await getTranslations("apiDocs")

  return (
    <>
      {text && <RichText text={text} />}
      {spec.webhooks && (
        <DocSection title={t("webhooks")}>
          <div className={`${LIST_BOX} overflow-hidden`}>
            {operationsOf(spec.webhooks).map((item) => (
              <Operation key={item.path} spec={spec} {...item} />
            ))}
          </div>
        </DocSection>
      )}
    </>
  )
}
