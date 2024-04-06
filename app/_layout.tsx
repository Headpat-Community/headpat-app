import AsyncStorage from '@react-native-async-storage/async-storage'
import { Theme, ThemeProvider } from '@react-navigation/native'
import { PortalHost } from '~/components/primitives/portal'
import { ToastProvider } from '~/components/primitives/deprecated-ui/toast'
import { SplashScreen, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as React from 'react'
import { Platform, Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ThemeToggle } from '~/components/ThemeToggle'
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar'
import { NAV_THEME } from '~/lib/constants'
import { useColorScheme } from '~/lib/useColorScheme'
import { Drawer } from 'expo-router/drawer'

const LIGHT_THEME: Theme = {
  dark: false,
  colors: NAV_THEME.light,
}
const DARK_THEME: Theme = {
  dark: true,
  colors: NAV_THEME.dark,
}

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
}

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme()
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false)

  React.useEffect(() => {
    ;(async () => {
      const theme = await AsyncStorage.getItem('theme')
      if (Platform.OS === 'web') {
        // Adds the background color to the html element to prevent white background on overscroll.
        document.documentElement.classList.add('bg-background')
      }
      if (!theme) {
        setAndroidNavigationBar(colorScheme)
        AsyncStorage.setItem('theme', colorScheme)
        setIsColorSchemeLoaded(true)
        return
      }
      const colorTheme = theme === 'dark' ? 'dark' : 'light'
      setAndroidNavigationBar(colorTheme)
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme)

        setIsColorSchemeLoaded(true)
        return
      }
      setIsColorSchemeLoaded(true)
    })().finally(() => {
      SplashScreen.hideAsync()
    })
  }, [])

  if (!isColorSchemeLoaded) {
    return null
  }

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Drawer initialRouteName={'Home'}>
          <Drawer.Screen
            name="home/index" // This is the name of the page and must match the url from root
            options={{
              drawerLabel: 'Home',
              title: 'Home',
              headerRight: () => <ThemeToggle />,
            }}
          />
          <Drawer.Screen
              name="gallery/index"
              options={{
                drawerLabel: 'Gallery',
                title: 'Gallery',
                headerRight: () => <ThemeToggle />,
              }}
          />
          <Drawer.Screen
            name="login/index" // This is the name of the page and must match the url from root
            options={{
              drawerLabel: 'Login',
              title: 'Login',
              headerRight: () => <ThemeToggle />,
            }}
          />
          <Drawer.Screen
            name="(tabs)"
            options={{
              drawerLabel: 'Tabs',
              title: 'Tabs',
              headerRight: () => <ThemeToggle />,
            }}
          />
          <Drawer.Screen
            name="button"
            options={{
              drawerLabel: 'Button',
              title: 'Button',
              headerRight: () => <ThemeToggle />,
              drawerItemStyle: { display: 'none' },
            }}
          />
          <Drawer.Screen
              name="material-top-tabs"
              options={{
                drawerLabel: 'Material Top Tabs',
                title: 'Material Top Tabs',
                headerRight: () => <ThemeToggle />,
              }}
          />
          <Drawer.Screen
              name="+not-found"
              options={{
                drawerLabel: 'Not Found',
                title: 'Not Found',
                headerRight: () => <ThemeToggle />,
                drawerItemStyle: { display: 'none' },
              }}
          />
        </Drawer>
      </GestureHandlerRootView>
      <PortalHost />
      <ToastProvider />
    </ThemeProvider>
  )
}
