"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { type DotsItem, DotsMenu } from "@/components/common/dots-menu"
import { DeleteInterview } from "@/features/company/components/delete-interview"

/** The "⋮" menu beside an interview's title, on every tab: `extra` (the open tab's own), trying
 * it, and Delete for those who can change it. */
export function InterviewTopMenu({
  interviewId,
  title,
  interviewsHref,
  canEdit,
  extra = [],
}: {
  interviewId: string
  title: string
  interviewsHref: string
  canEdit: boolean
  extra?: DotsItem[]
}) {
  const t = useTranslations("interviews")
  const common = useTranslations("common")
  const [removing, setRemoving] = useState(false)

  return (
    <>
      <DotsMenu
        items={[
          ...extra,
          { label: t("try"), href: `${interviewsHref}/${interviewId}/try` },
          ...(canEdit
            ? [
                {
                  label: common("delete"),
                  onClick: () => setRemoving(true),
                  destructive: true,
                },
              ]
            : []),
        ]}
      />
      {canEdit && (
        <DeleteInterview
          interviewId={interviewId}
          title={title}
          leaveTo={interviewsHref}
          opened={removing}
          onOpenedChange={setRemoving}
        />
      )}
    </>
  )
}
