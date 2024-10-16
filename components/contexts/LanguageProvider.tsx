import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { i18n } from '~/components/system/i18n'
import * as Localization from 'expo-localization'

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
        (await AsyncStorage.getItem('locale')) ||
        Localization.getLocales()[0].languageCode
      await AsyncStorage.setItem('locale', locale)
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
    await AsyncStorage.setItem('locale', newLanguage)
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
