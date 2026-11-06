"use client"

import { LoaderCircleIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FloatingInput } from "@/components/ui/floating-field"
import { MAX_COMPANY_NAME_LENGTH } from "@/config/limits"
import { useCreateCompany } from "@/features/company/hooks/use-create-company"
import { useHumanCheck } from "@/hooks/use-human-check"

export function CreateCompany({ templateId }: { templateId?: string }) {
  const t = useTranslations("company")
  const common = useTranslations("common")
  const [open, setOpen] = useState(false)
  // Ready once the dialog with its form opens.
  useHumanCheck(open)
  const { name, rename, saving, nameError, reset, create } =
    useCreateCompany(templateId)

  function handleOpen(next: boolean) {
    if (saving) {
      return
    }

    setOpen(next)

    if (!next) {
      reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger
        data-testid="new-company"
        render={<Button className="h-12 px-6 text-base max-sm:w-full" />}
      >
        {t("new")}
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("new")}</DialogTitle>
          <DialogDescription>{t("newText")}</DialogDescription>
        </DialogHeader>
        <form
          id="create-company-form"
          onSubmit={create}
          className="flow-root space-y-2"
        >
          <FloatingInput
            label={t("name")}
            placeholder={t("namePlaceholder")}
            required
            autoFocus
            maxLength={MAX_COMPANY_NAME_LENGTH}
            value={name}
            onChange={(event) => rename(event.target.value)}
            aria-invalid={nameError !== null}
            aria-describedby={nameError ? "company-name-error" : undefined}
            className="normal-case placeholder:normal-case"
          />
          {nameError && (
            <p
              id="company-name-error"
              role="alert"
              className="text-sm text-destructive"
            >
              {nameError}
            </p>
          )}
        </form>
        <DialogFooter>
          <DialogClose
            render={
              <Button
                variant="outline"
                className="h-10 px-5 text-base"
                disabled={saving}
              />
            }
          >
            {common("cancel")}
          </DialogClose>
          <Button
            type="submit"
            form="create-company-form"
            className="h-10 px-5 text-base"
            disabled={saving || !name.trim()}
          >
            {saving && <LoaderCircleIcon className="animate-spin" />}
            {t("create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
