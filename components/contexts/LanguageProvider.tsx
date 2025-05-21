import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import kv from 'expo-sqlite/kv-store'
import { i18n } from '~/components/system/i18n'
import { getLocales } from 'expo-localization'

interface LanguageContextProps {
  language: string
  setLanguage: (language: string) => void
}

const LanguageContext = createContext<LanguageContextProps | undefined>(
  undefined
)

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const [language, setLanguage] = useState('en')

  useEffect(() => {
    const getLocale = async () => {
      // Check language
      const locale =
        (await kv.getItem('locale')) || getLocales()[0].languageCode
      await kv.setItem('locale', locale)
      i18n.enableFallback = true
      i18n.defaultLocale = 'en'
      setLanguage(locale)
      i18n.locale = locale
    }
    getLocale().then()
  }, [])

  const changeLanguage = async (newLanguage: string) => {
    setLanguage(newLanguage)
    i18n.locale = newLanguage
    await kv.setItem('locale', newLanguage)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
