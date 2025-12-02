export default async function loadDictionary(locale: string) {
  switch (locale) {
    case 'en':
      return (await import('~/components/i18n/translations/en.json')).default
    case 'de':
      return (await import('~/components/i18n/translations/de.json')).default
    case 'nl':
      return (await import('~/components/i18n/translations/nl.json')).default
    default:
      return (await import('~/components/i18n/translations/en.json')).default
  }
}
