import de from '~/components/i18n/translations/de.json'
import en from '~/components/i18n/translations/en.json'
import nl from '~/components/i18n/translations/nl.json'

const dictionaries = {
  en,
  de,
  nl,
} as const

export async function loadDictionary(locale: string) {
  return Promise.resolve(dictionaries[locale as keyof typeof dictionaries])
}