"use client"

import { CheckCheckIcon, CheckIcon, LayersIcon } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { cn } from "cn"

import { useLocalTime } from "@/hooks/use-local-time"
import { useUrlLocale } from "@/components/common/localized-link"
import { UseTemplate } from "@/features/templates/components/use-template"
import { IconStat } from "@/components/common/icon-stat"
import { SubtopicList } from "@/components/common/subtopic-list"
import { Badge } from "@/components/ui/badge"
import { VirtualList } from "@/components/common/virtual-list"
import { usePagedList } from "@/hooks/use-paged-list"
import { gradeTone } from "@/lib/grade-tone"
import { byId } from "@/lib/paged-list"
import { hasMessage } from "@/lib/messages"
import { localizedPath } from "@/lib/locale-path"
import type { PracticeStatus } from "@/types/round"
import type { CompanyTemplate } from "@/types/company"
import type { TemplateSummary } from "@/types/superadmin"
import { LIST_BOX, LIST_EMPTY, ROW_HOVER } from "@/config/lists"

// The company's list says more about each one (features/templates/components/template-list.tsx).
type ListedTemplate = TemplateSummary & Partial<CompanyTemplate>
// Topic names a row shows, for an idea of what's inside.
const TOPICS_SHOWN = 3

/** What a company's interview from a template adds up to, its first topics, and how many of its
 * interviews came from it. */
function TemplateContents({ template }: { template: ListedTemplate }) {
  const t = useTranslations("templates")
  const used = template.used_count ?? 0

  return (
    <>
      <span
        className="block text-sm text-muted-foreground"
        data-testid="template-contents"
      >
        {t("contents", {
          topics: template.topic_count,
          questions: template.question_count ?? 0,
          minutes: template.minutes ?? 0,
        })}
      </span>
      <span className="block pt-2">
        <SubtopicList
          subtopics={template.topic_titles?.slice(0, TOPICS_SHOWN) ?? []}
          small
        />
      </span>
      {used > 0 && (
        <span
          className="block text-sm text-primary"
          data-testid="template-used"
        >
          {t("usedIn", { count: used })}
        </span>
      )}
    </>
  )
}

/** The templates at `path`, newest first, a page at a time; `initial` is the server's first
 * page, and `empty` shows when there are none. A row opens the template under `openBase` (by its
 * slug with `bySlug`), and
 * for `companyId` also ends with a "Use template" button. A template in `statuses` shows the
 * signed-in talent's progress on it after its title: a check while in progress, a double check
 * in the results' green once completed, each named in its tooltip. */
export function TemplateList({
  path,
  initial,
  empty,
  openBase,
  companyId,
  bySlug,
  statuses,
  topicsLine = false,
}: {
  path: string
  initial: ListedTemplate[]
  empty: string
  openBase: string
  companyId?: string
  bySlug?: boolean
  statuses?: PracticeStatus[]
  topicsLine?: boolean
}) {
  const t = useTranslations("templates")
  const localTime = useLocalTime()
  const urlLocale = useUrlLocale()
  const { items, loadMore } = usePagedList(path, byId, initial)
  const practiced = new Map(
    (statuses ?? []).map((status) => [status.template_id, status])
  )

  if (items.length === 0) {
    return <p className={LIST_EMPTY}>{empty}</p>
  }

  return (
    <VirtualList
      items={items}
      getKey={byId}
      estimateSize={89}
      onEndReached={loadMore}
      className={LIST_BOX}
      renderItem={(template) => {
        const level = `levels.${template.level}` as const
        const practice = practiced.get(template.id)
        const row = (
          <>
            <span className="min-w-0 flex-1 basis-full space-y-1 sm:basis-auto">
              {/* On phones the title wraps and its mark follows its last word; from sm up, the
                  title truncates and the mark stays beside it. */}
              <span className="block text-lg font-medium break-words sm:flex sm:items-center sm:gap-2">
                <span className="sm:min-w-0 sm:truncate">{template.title}</span>
                {practice &&
                  (practice.status === "completed" ? (
                    <IconStat
                      label={t("completed", {
                        done: practice.topics_done,
                        total: practice.topics_total,
                      })}
                      icon={<CheckCheckIcon aria-hidden className="size-5" />}
                      className={cn(
                        gradeTone(true),
                        "ms-1 hover:text-current sm:-ms-1"
                      )}
                      data-status={practice.status}
                    />
                  ) : (
                    <IconStat
                      label={t("inProgress", {
                        done: practice.topics_done,
                        total: practice.topics_total,
                      })}
                      icon={<CheckIcon aria-hidden className="size-5" />}
                      className="ms-1 text-primary hover:text-primary sm:-ms-1"
                      data-status={practice.status}
                    />
                  ))}
              </span>
              {template.topic_titles ? (
                <TemplateContents template={template} />
              ) : topicsLine ? (
                <span
                  data-testid="template-topics"
                  className="block text-sm text-muted-foreground"
                >
                  {t("topics", { count: template.topic_count })}
                </span>
              ) : (
                <span className="block text-sm text-muted-foreground">
                  <time dateTime={template.created_at} suppressHydrationWarning>
                    {localTime.date(template.created_at)}
                  </time>
                </span>
              )}
            </span>
            {/* Their own column, so the tags line up whatever the title's length. */}
            <span className="flex shrink-0 gap-2">
              <Badge variant="outline" className="h-8 px-4 text-sm font-light">
                {hasMessage(t, level) ? t(level) : template.level}
              </Badge>
              <Badge
                variant="outline"
                className="h-8 px-4 text-sm font-light uppercase"
              >
                {template.language}
              </Badge>
            </span>
            {/* A fixed column on every row; the hover background only around the icon and count. */}
            {!template.topic_titles && !topicsLine && (
              <span className="ms-auto flex w-12 shrink-0 justify-end sm:-ms-2">
                <IconStat
                  label={t("topics", { count: template.topic_count })}
                  icon={<LayersIcon aria-hidden className="size-5" />}
                  className="text-sm"
                >
                  {template.topic_count}
                </IconStat>
              </span>
            )}
          </>
        )

        const href = `${openBase}/${(bySlug && template.slug) || template.id}`

        // One hover surface: the link stretches over the whole row, "Use template" sits on top;
        // on phones it takes its own line, at full width.
        return (
          <div
            className={`group/row relative flex items-center gap-6 p-6 ${ROW_HOVER} max-sm:flex-wrap max-sm:gap-4`}
          >
            <Link
              // On a language's address (/de/tests), a template in that language opens there
              // too; the others have only their English address.
              href={
                template.language === urlLocale
                  ? localizedPath(urlLocale, href)
                  : href
              }
              // On phones the title takes its own line, the tags and count the next.
              className="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-3 after:absolute after:inset-0 sm:flex-nowrap"
            >
              {row}
            </Link>
            {companyId && (
              <div className="relative z-10 max-sm:basis-full max-sm:*:w-full">
                <UseTemplate templateId={template.id} companyId={companyId} />
              </div>
            )}
          </div>
        )
      }}
    />
  )
}
