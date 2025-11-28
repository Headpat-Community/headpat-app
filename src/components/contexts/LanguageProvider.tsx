import type React from "react"
import { createContext, useContext, type ReactNode } from "react"
import { i18n } from "~/components/system/i18n"
import { getLocales } from "expo-localization"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface LanguageContextProps {
  language: string
  setLanguage: (language: string) => Promise<void>
}

const LanguageContext = createContext<LanguageContextProps | undefined>(
  undefined
)

interface LanguageProviderProps {
  children: ReactNode
}

const LANGUAGE_QUERY_KEY = "app-language"

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
}) => {
  const queryClient = useQueryClient()

  const { data: language = "en" } = useQuery({
    queryKey: [LANGUAGE_QUERY_KEY],
    queryFn: async () => {
      const locale =
        (await AsyncStorage.getItem("locale")) ?? getLocales()[0].languageCode
      await AsyncStorage.setItem("locale", locale ?? "")
      i18n.enableFallback = true
      i18n.defaultLocale = "en"
      i18n.locale = locale ?? ""
      return locale
    },
    staleTime: Infinity, // Language rarely changes
  })

  const changeLanguageMutation = useMutation({
    mutationFn: async (newLanguage: string) => {
      await AsyncStorage.setItem("locale", newLanguage)
      i18n.locale = newLanguage
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
    <LanguageContext.Provider value={{ language: language ?? "", setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
