import kv from 'expo-sqlite/kv-store'
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
import { useEffect, useState, useMemo } from 'react'
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
import { databases } from '~/lib/appwrite-client'
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
import { DataCacheProvider } from '~/components/contexts/DataCacheContext'

const LIGHT_THEME: Theme = {
  fonts: {
    regular: {
      fontFamily: 'Inter_400Regular',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'Inter_500Medium',
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'Inter_700Bold',
      fontWeight: '700',
    },
    heavy: {
      fontFamily: 'Inter_800Heavy',
      fontWeight: '800',
    },
  },
  dark: false,
  colors: NAV_THEME.light,
}
const DARK_THEME: Theme = {
  fonts: {
    regular: {
      fontFamily: 'Inter_400Regular',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'Inter_500Medium',
      fontWeight: '500',
    },
    bold: {
      fontFamily: 'Inter_700Bold',
      fontWeight: '700',
    },
    heavy: {
      fontFamily: 'Inter_800Heavy',
      fontWeight: '800',
    },
  },
  dark: true,
  colors: NAV_THEME.dark,
}

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: 'index',
}

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme()
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false)
  const [lastBackPressed, setLastBackPressed] = useState(0)
  const [openEulaModal, setOpenEulaModal] = useState(false)
  const [versionData, setVersionData] = useState(null)
  const [isMounted, setIsMounted] = useState(false)

  const theme = useMemo(
    () => (isDarkColorScheme ? DARK_THEME : LIGHT_THEME),
    [isDarkColorScheme]
  )

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
    const initialize = async () => {
      const theme = await kv.getItem('theme')
      const colorTheme = theme === 'dark' ? 'dark' : 'light'
      await setAndroidNavigationBar(colorTheme)
      if (colorTheme !== colorScheme) {
        setColorScheme(colorTheme)
      }
      setIsColorSchemeLoaded(true)
      await SplashScreen.hideAsync()
      setIsMounted(true)
    }
    initialize().then()
  }, [colorScheme, setColorScheme])

  const router = useRouter()
  const segments = useSegments()
  useEffect(() => {
    const backAction = () => {
      const now = Date.now()
      if (segments.length > 0) {
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
    const handleMessaging = async () => {
      messaging().onMessage(async (remoteMessage) => {
        console.log(remoteMessage)
      })
      messaging().onNotificationOpenedApp(async (remoteMessage) => {
        if (remoteMessage?.data?.type === 'newFollower') {
          router.navigate(`/user/(stacks)/${remoteMessage.data.userId}`)
        } else if (remoteMessage?.data?.type === 'newMessage') {
          router.navigate(`/chat/${remoteMessage.data.userId}`)
        }
      })
      requestUserPermission().then()
      messaging().onTokenRefresh(async (newFcmToken) => {
        if (!newFcmToken) return
        await kv.setItem('fcmToken', newFcmToken)
        await updatePushTargetWithAppwrite(newFcmToken)
      })
    }
    handleMessaging().then()
  }, [router])

  useEffect(() => {
    const getEulaVersion = async () => {
      try {
        const data = await databases.getDocument('config', 'legal', 'eula')
        const eula = await kv.getItem('eula')
        if (eula !== data.version) {
          const allKeys = await kv.getAllKeys()
          const eulaKeys = allKeys.filter((key) => key.startsWith('eula'))
          await kv.multiRemove(eulaKeys)
          setVersionData(data)
          setOpenEulaModal(true)
        }
      } catch (error) {
        Sentry.captureException(error)
      }
    }
    if (isMounted) {
      onFetchUpdateAsync().then()
      getEulaVersion().then()
      bootstrap().then()
    }
  }, [isMounted])

  if (!isColorSchemeLoaded) {
    return null
  }

  return (
    <ThemeProvider value={theme}>
      <LanguageProvider>
        <AlertModalProvider>
          <UserProvider>
            <DataCacheProvider>
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
                            keyboardHandlingEnabled: true,
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
            </DataCacheProvider>
          </UserProvider>
        </AlertModalProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

async function bootstrap() {
  const initialNotification = await messaging().getInitialNotification()
  if (initialNotification?.data?.type === 'newFollower') {
    router.navigate(`/user/(stacks)/${initialNotification.data.userId}`)
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
