import AsyncStorage from '@react-native-async-storage/async-storage'
import { Theme, ThemeProvider } from '@react-navigation/native'
import { PortalHost } from '~/components/primitives/portal'
import { ToastProvider } from '~/components/primitives/deprecated-ui/toast'
import {
  router,
  SplashScreen,
  Stack,
  useRouter,
  useSegments,
} from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { BackHandler } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ProfileThemeToggle } from '~/components/ThemeToggle'
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar'
import { NAV_THEME } from '~/lib/constants'
import { useColorScheme } from '~/lib/useColorScheme'
import {
  updatePushTargetWithAppwrite,
  UserProvider,
} from '~/components/contexts/UserContext'
import { DrawerScreensData } from '~/components/data/DrawerScreensData'
import { database } from '~/lib/appwrite-client'
import { toast } from '~/lib/toast'
import messaging from '@react-native-firebase/messaging'
import { requestUserPermission } from '~/components/system/pushNotifications'
import { AlertModalProvider } from '~/components/contexts/AlertModalProvider'
import * as Sentry from '@sentry/react-native'
import EulaModal from '~/components/system/EulaModal'
import * as Updates from 'expo-updates'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { HeaderMenuSidebar } from '~/components/data/DrawerData'
import { LocationProvider } from '~/components/contexts/SharingContext'
import { LanguageProvider } from '~/components/contexts/LanguageProvider'
import '../components/system/backgroundTasks'

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

/**
 * Deleting this line will break the app.
 * It's literally unstable.
 */
export const unstable_settings = {
  initialRouteName: 'index',
}

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme()
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false)
  const [lastBackPressed, setLastBackPressed] = useState(0)
  const [openEulaModal, setOpenEulaModal] = useState(false)
  const [versionData, setVersionData] = useState(null)
  const [isMounted, setIsMounted] = useState(false)

  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync()

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync()

        await Updates.reloadAsync()
      }
    } catch (error) {
      Sentry.captureException(error)
    }
  }

  useEffect(() => {
    ;(async () => {
      const theme = await AsyncStorage.getItem('theme')
      if (!theme) {
        await setAndroidNavigationBar(colorScheme)
        await AsyncStorage.setItem('theme', colorScheme)
        setIsColorSchemeLoaded(true)
        return
      }
      const colorTheme = theme === 'dark' ? 'dark' : 'light'
      await setAndroidNavigationBar(colorTheme)
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme)

        setIsColorSchemeLoaded(true)
        return
      }
      setIsColorSchemeLoaded(true)
    })().finally(() => {
      SplashScreen.hideAsync()
      setIsMounted(true) // Set the mounted state to true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colorScheme])

  const router = useRouter()
  const segments = useSegments()
  useEffect(() => {
    const backAction = () => {
      const now = Date.now()
      if (segments.length > 1) {
        // If there is more than one segment, go back to the previous segment
        router.back()
      } else {
        if (now - lastBackPressed < 2000) {
          BackHandler.exitApp()
        } else {
          toast('Press back again to exit')
          setLastBackPressed(now)
        }
      }
      return true
    }

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    )

    return () => backHandler.remove()
  }, [router, segments, lastBackPressed])

  useEffect(() => {
    return messaging().onMessage(async (remoteMessage) => {
      //Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage))
      console.log(remoteMessage)
    })
  }, [])

  useEffect(() => {
    if (isMounted) {
      onFetchUpdateAsync().then()
      bootstrap().catch(console.error)
    }
  }, [isMounted]) // Add isMounted as a dependency

  messaging().onNotificationOpenedApp(async (remoteMessage) => {
    if (remoteMessage?.data?.type === 'newFollower') {
      router.navigate(`/user/(stacks)/${remoteMessage.data.userId}`)
    }
  })

  useEffect(() => {
    requestUserPermission().then()

    return messaging().onTokenRefresh(async (newFcmToken) => {
      if (!newFcmToken) return
      //console.log('FCM token refreshed:', newFcmToken)
      await AsyncStorage.setItem('fcmToken', newFcmToken)
      await updatePushTargetWithAppwrite(newFcmToken)
    })
  }, [])

  useEffect(() => {
    const getEulaVersion = async () => {
      try {
        // Get EULA version
        const data = await database.getDocument('config', 'legal', 'eula')
        // Get EULA cookie
        AsyncStorage.getItem(`eula`).then(async (eula) => {
          if (eula !== data.version) {
            const allKeys = await AsyncStorage.getAllKeys()
            const eulaKeys = allKeys.filter((key) => key.startsWith('eula'))
            await AsyncStorage.multiRemove(eulaKeys)
            setVersionData(data)
            setOpenEulaModal(true)
          }
        })
      } catch (error) {
        Sentry.captureException(error)
      }
    }

    getEulaVersion().then()
  }, [isMounted])

  if (!isColorSchemeLoaded) {
    return null
  }

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <LanguageProvider>
        <AlertModalProvider>
          <UserProvider>
            <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
            <EulaModal
              isOpen={openEulaModal}
              setOpen={setOpenEulaModal}
              versionData={versionData}
            />
            <LocationProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <BottomSheetModalProvider>
                  <Stack>
                    {DrawerScreensData.map((screen: DrawerProps) => (
                      <Stack.Screen
                        key={screen.location}
                        name={screen.location}
                        options={{
                          headerTitleAlign: 'left',
                          headerShown: screen.headerShown,
                          headerTitle: screen.title,
                          headerLargeTitle: screen.headerLargeTitle,
                          headerLeft: () =>
                            screen.headerLeft || <HeaderMenuSidebar />,
                          headerRight: () =>
                            screen.headerRight || <ProfileThemeToggle />,
                        }}
                      />
                    ))}
                  </Stack>
                </BottomSheetModalProvider>
              </GestureHandlerRootView>
            </LocationProvider>
            <PortalHost />
            <ToastProvider />
          </UserProvider>
        </AlertModalProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

// Update the bootstrap function
async function bootstrap() {
  const initialNotification = await messaging().getInitialNotification()

  if (initialNotification) {
    if (initialNotification?.data?.type === 'newFollower') {
      router.navigate(`/user/(stacks)/${initialNotification.data.userId}`)
    }
  }
}

export interface DrawerProps {
  location: string
  title: string
  swipeEnabled?: boolean
  headerShown?: boolean
  headerLargeTitle?: boolean
  headerLeft?: React.ReactNode
  headerRight?: React.ReactNode
}
