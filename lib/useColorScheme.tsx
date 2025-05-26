import { useColorScheme as useNativewindColorScheme } from 'nativewind'
import { useCallback, useEffect, useState } from 'react'
import { setAndroidNavigationBar } from './android-navigation-bar'
import AsyncStorage from '@react-native-async-storage/async-storage'

type Theme = 'light' | 'dark' | 'system'

export function useColorScheme() {
  const {
    colorScheme,
    setColorScheme: setNativewindColorScheme,
    toggleColorScheme
  } = useNativewindColorScheme()
  const [isLoading, setIsLoading] = useState(false)

  // Initialize theme from storage
  useEffect(() => {
    const initializeTheme = async () => {
      const storedTheme = (await AsyncStorage.getItem('theme')) as Theme
      if (storedTheme && storedTheme !== colorScheme) {
        setNativewindColorScheme(storedTheme)
        await setAndroidNavigationBar(storedTheme as 'light' | 'dark')
      }
    }
    initializeTheme()
  }, [])

  const setColorScheme = useCallback(
    async (newTheme: 'light' | 'dark') => {
      if (isLoading) return

      setIsLoading(true)
      try {
        // Run all async operations in parallel
        await Promise.all([
          setNativewindColorScheme(newTheme),
          setAndroidNavigationBar(newTheme),
          AsyncStorage.setItem('theme', newTheme)
        ])
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, setNativewindColorScheme]
  )

  return {
    colorScheme: colorScheme ?? 'dark',
    isDarkColorScheme: colorScheme === 'dark',
    setColorScheme,
    toggleColorScheme,
    isLoading
  }
}
