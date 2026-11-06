import { getLocale, getTranslations } from "next-intl/server"

import {
  DeleteAccountButton,
  DownloadData,
} from "@/features/settings/components/account-data"
import { AccountId } from "@/features/settings/components/account-id"
import { EmailPreferencesSetting } from "@/components/common/email-preferences"
import { CurrencySetting } from "@/features/settings/components/currency-setting"
import { LanguageSetting } from "@/features/settings/components/language-setting"
import { OpenToOffersCard } from "@/features/practice/components/open-to-offers"
import {
  SettingRow,
  SettingsGroup,
} from "@/features/company/components/setting-rows"
import type { Locale } from "@/config/i18n"
import { currencyPath } from "@/lib/catalog"
import { serverFetch } from "@/lib/server-api"
import type { CurrencyChoice } from "@/types/billing"
import type { EmailPreferences } from "@/types/emails"
import type { OpenToOffers } from "@/types/round"

export default async function GeneralSettingsPage() {
  const t = await getTranslations("settings")
  const locale = (await getLocale()) as Locale
  const [emails, currency, offers] = await Promise.all([
    serverFetch<EmailPreferences>("/accounts/me/email-preferences"),
    serverFetch<CurrencyChoice>(await currencyPath()),
    serverFetch<OpenToOffers>("/rounds/open-to-offers"),
  ])

  return (
    <>
      <SettingsGroup title={t("preferences")}>
        <SettingRow label={t("language")} help={t("languageNote")}>
          <LanguageSetting current={locale} />
        </SettingRow>
        {currency && (
          <SettingRow label={t("currency")} help={t("currencyNote")}>
            <CurrencySetting initial={currency} />
          </SettingRow>
        )}
      </SettingsGroup>
      {emails && (
        <SettingsGroup
          title={t("emails.title")}
          description={t("emails.note")}
          plain
        >
          <EmailPreferencesSetting initial={emails} />
        </SettingsGroup>
      )}
      {offers && <OpenToOffersCard initial={offers} />}
      <SettingsGroup title={t("account")}>
        <SettingRow label={t("accountId")} help={t("accountNote")}>
          <AccountId />
        </SettingRow>
        <SettingRow label={t("yourData")} help={t("yourDataNote")}>
          <DownloadData />
        </SettingRow>
        <SettingRow label={t("deleteTitle")} help={t("deleteNote")}>
          <DeleteAccountButton />
        </SettingRow>
      </SettingsGroup>
    </>
  )
}
