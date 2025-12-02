import { I18n } from 'i18n-js'
import en from '~/components/i18n/translations/en.json'
import de from '~/components/i18n/translations/de.json'
import nl from '~/components/i18n/translations/nl.json'

export const i18n = new I18n(
  {
    en: en,
    de: de,
    nl: nl
  },
  {
    enableFallback: true,
    defaultLocale: 'en'
  }
)

const dictionaries = {
  en,
  de,
  nl,
} as const

export async function loadDictionary(locale: string) {
  return Promise.resolve(dictionaries[locale as keyof typeof dictionaries])
}
