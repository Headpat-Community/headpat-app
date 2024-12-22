import { I18n } from 'i18n-js'
import en from '~/components/i18n/translations/en.json'
import de from '~/components/i18n/translations/de.json'
import nl from '~/components/i18n/translations/nl.json'

export const i18n = new I18n({
  translations: {
    en,
    de,
    nl,
  },
  options: {
    enableFallback: true,
    defaultLocale: 'en',
  },
})
