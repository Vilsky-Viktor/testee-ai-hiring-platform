import { notFound } from "next/navigation"
import { getLocale, getTranslations } from "next-intl/server"

import { ContentArticle } from "@/features/content/components/content-article"
import type { ContentFolder } from "@/config/content"
import { contentLanguages, contentPage } from "@/lib/content"
import { pageMetadata } from "@/lib/site"
import type { PageHelpKey } from "@/types/page-help"

type Params = { params: Promise<{ slug: string }> }

// The metadata and the page of one content page, in the interface's language where translated.

async function metadata(folder: ContentFolder, slug: string, path: string) {
  const page = await contentPage(folder, slug, await getLocale())

  return page
    ? pageMetadata(
        page.seoTitle,
        page.description,
        path,
        await contentLanguages(folder, slug)
      )
    : {}
}

/** Done a turn after the metadata. Next.js holds the page's first bytes for the metadata but
 * renders the two apart, so an article, as quick as its metadata, could get there first and leave
 * the tags in the body, whatever `htmlLimitedBots` says. */
async function afterMetadata(
  folder: ContentFolder,
  slug: string,
  path: string
) {
  await metadata(folder, slug, path)
  await new Promise((resolve) => setImmediate(resolve))
}

async function article(
  folder: ContentFolder,
  slug: string,
  path: string,
  pageKey: PageHelpKey,
  section?: { name: string; path: string }
) {
  const page = await contentPage(folder, slug, await getLocale())

  if (!page) {
    notFound()
  }

  await afterMetadata(folder, slug, path)

  return (
    <ContentArticle
      page={page}
      path={path}
      pageKey={pageKey}
      section={section}
    />
  )
}

/** A hub's article (content/guides/<slug>.md at /guides/<slug>), under the hub. */
export function hubArticleRoute(hub: "guides" | "compare") {
  return {
    generateMetadata: async ({ params }: Params) => {
      const { slug } = await params

      return metadata(hub, slug, `/${hub}/${slug}`)
    },
    Page: async ({ params }: Params) => {
      const { slug } = await params
      const t = await getTranslations(hub)

      return article(
        hub,
        slug,
        `/${hub}/${slug}`,
        hub === "guides" ? "guide" : "comparison",
        {
          name: t("title"),
          path: `/${hub}`,
        }
      )
    },
  }
}
