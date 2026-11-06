import { ChevronDownIcon } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Fields, TypeName } from "@/features/api-docs/components/fields"
import { RichLine, RichText } from "@/features/api-docs/components/rich-text"
import { Badge } from "@/components/ui/badge"
import { ROW_HOVER, ROW_ICON } from "@/config/lists"
import {
  bodySchema,
  errorsOf,
  fieldsOf,
  successSchema,
  typeOf,
} from "@/lib/openapi"
import type { OpenApi, Operation as OperationSpec } from "@/types/openapi"

/** One route (or web hook) as a row of a list: its method, path and what it does, opening to what
 * it takes, what it returns and the errors it may answer with. */
export async function Operation({
  spec,
  method,
  path,
  operation,
}: {
  spec: OpenApi
  method: string
  path: string
  operation: OperationSpec
}) {
  const t = await getTranslations("apiDocs")
  const parameters = (operation.parameters ?? []).map((parameter) => ({
    name: parameter.name,
    type: `${typeOf(parameter.schema)}, ${parameter.in}`,
    required: parameter.required ?? false,
    description: parameter.description ?? "",
  }))
  const body = bodySchema(operation)
  const returns = successSchema(operation)
  const errors = errorsOf(operation)

  return (
    <details data-testid="operation" className="group/details">
      <summary
        className={`group/row flex cursor-pointer list-none items-center gap-4 p-4 sm:px-6 ${ROW_HOVER} [&::-webkit-details-marker]:hidden`}
      >
        <Badge
          variant="secondary"
          className="h-7 w-16 shrink-0 justify-center px-0 font-mono text-xs normal-case group-hover/row:bg-input"
        >
          {method}
        </Badge>
        <span className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <code className="block font-mono text-sm break-all">{path}</code>
          <span className="block text-sm text-muted-foreground sm:shrink-0 sm:text-end">
            {operation.summary}
          </span>
        </span>
        <span aria-hidden className={`${ROW_ICON} size-8`}>
          <ChevronDownIcon className="size-4 transition-transform group-open/details:rotate-180" />
        </span>
      </summary>
      <div className="space-y-5 border-t p-4 sm:p-6">
        {operation.description && <RichText text={operation.description} />}
        {parameters.length > 0 && (
          <Part title={t("parameters")}>
            <Fields fields={parameters} />
          </Part>
        )}
        {body && (
          <Part title={t("body")}>
            <Fields fields={fieldsOf(spec, body)} />
          </Part>
        )}
        {returns && Object.keys(returns).length > 0 && (
          <Part title={t("returns")}>
            <TypeName type={typeOf(returns)} />
          </Part>
        )}
        {errors.length > 0 && (
          <Part title={t("errors")}>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {errors.map((error) => (
                <li key={error.code}>
                  <code className="font-mono font-medium text-foreground">
                    {error.code}
                  </code>{" "}
                  <RichLine text={error.description} />
                </li>
              ))}
            </ul>
          </Part>
        )}
      </div>
    </details>
  )
}

function Part({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      {children}
    </section>
  )
}
