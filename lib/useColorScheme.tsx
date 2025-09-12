import { useColorScheme as useNativewindColorScheme } from "nativewind"
import { useCallback, useEffect, useState } from "react"
import { setAndroidNavigationBar } from "./android-navigation-bar"
import AsyncStorage from "@react-native-async-storage/async-storage"

type Theme = "light" | "dark" | "system"

export function useColorScheme() {
  const colorSchemeHook = useNativewindColorScheme()
  const { colorScheme } = colorSchemeHook
  const setNativewindColorScheme = (scheme: Theme) =>
    colorSchemeHook.setColorScheme(scheme)
  const toggleColorScheme = () => colorSchemeHook.toggleColorScheme()
  const [isLoading, setIsLoading] = useState(false)

  // Initialize theme from storage
  useEffect(() => {
    const initializeTheme = async () => {
      const storedTheme = (await AsyncStorage.getItem("theme")) as Theme
      if (storedTheme !== colorScheme) {
        setNativewindColorScheme(storedTheme)
        await setAndroidNavigationBar(storedTheme as "light" | "dark")
      }
    }
    void initializeTheme()
  }, [])

  const setColorScheme = useCallback(
    async (newTheme: "light" | "dark") => {
      if (isLoading) return

      setIsLoading(true)
      try {
        // Run all async operations in parallel
        setNativewindColorScheme(newTheme)
        await setAndroidNavigationBar(newTheme)
        await AsyncStorage.setItem("theme", newTheme)
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, setNativewindColorScheme]
  )

  return {
    colorScheme: colorScheme ?? "dark",
    isDarkColorScheme: colorScheme === "dark",
    setColorScheme,
    toggleColorScheme,
    isLoading,
  }
}
