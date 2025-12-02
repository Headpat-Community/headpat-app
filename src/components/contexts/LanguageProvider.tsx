import AsyncStorage from '@react-native-async-storage/async-storage'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getLocales } from 'expo-localization'
import { useSetLocale } from 'gt-react-native'
import type React from 'react'
import { createContext, type ReactNode, useContext } from 'react'

interface LanguageContextProps {
  language: string
  setLanguage: (language: string) => Promise<void>
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

const LANGUAGE_QUERY_KEY = 'app-language'

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const queryClient = useQueryClient()
  const setLocale = useSetLocale()
  const { data: language = 'en' } = useQuery({
    queryKey: [LANGUAGE_QUERY_KEY],
    queryFn: async () => {
      const locale = (await AsyncStorage.getItem('locale')) ?? getLocales()[0].languageCode
      await AsyncStorage.setItem('locale', locale ?? '')
      return locale
    },
    staleTime: Infinity, // Language rarely changes
  })

  const changeLanguageMutation = useMutation({
    mutationFn: async (newLanguage: string) => {
      await AsyncStorage.setItem('locale', newLanguage)
      setLocale(newLanguage)
      return newLanguage
    },
    onSuccess: (newLanguage) => {
      queryClient.setQueryData([LANGUAGE_QUERY_KEY], newLanguage)
    },
  })

  const setLanguage = async (newLanguage: string) => {
    await changeLanguageMutation.mutateAsync(newLanguage)
  }

  return (
    <LanguageContext.Provider value={{ language: language ?? 'en', setLanguage }}>
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
