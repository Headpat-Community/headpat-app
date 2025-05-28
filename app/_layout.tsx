import AsyncStorage from '@react-native-async-storage/async-storage'
import { ThemeProvider } from '@react-navigation/native'
import { PortalHost } from '~/components/primitives/portal'
import {
  router,
  SplashScreen,
  Stack,
  useRouter,
  useSegments
} from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { useEffect, useState, useMemo } from 'react'
import { BackHandler } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ProfileThemeToggle } from '~/components/ThemeToggle'
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar'
import { NAV_THEME } from '~/lib/constants'
import { useColorScheme } from '~/lib/useColorScheme'
import {
  updatePushTargetWithAppwrite,
  UserProvider
} from '~/components/contexts/UserContext'
import { DrawerScreensData } from '~/components/data/DrawerScreensData'
import { databases } from '~/lib/appwrite-client'
import { toast } from '~/lib/toast'
import {
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh
} from '@react-native-firebase/messaging'
import { requestUserPermission } from '~/components/system/pushNotifications'
import { AlertModalProvider } from '~/components/contexts/AlertModalProvider'
import { captureException } from '@sentry/react-native'
import EulaModal from '~/components/system/EulaModal'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { HeaderMenuSidebar } from '~/components/data/DrawerData'
import { LocationProvider } from '~/components/contexts/SharingContext'
import { LanguageProvider } from '~/components/contexts/LanguageProvider'
import CacheProvider from '~/components/contexts/cacheProvider'
import { NotifierWrapper } from 'react-native-notifier'
import '../components/system/backgroundTasks'
import '../globals.css'
import '../components/init/sentryInit'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: 'index'
}

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme()
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false)
  const [lastBackPressed, setLastBackPressed] = useState(0)
  const [openEulaModal, setOpenEulaModal] = useState(false)
  const [versionData, setVersionData] = useState(null)
  const [isMounted, setIsMounted] = useState(false)
  const messaging = getMessaging()

  const theme = useMemo(
    () => ({
      fonts: {
        regular: {
          fontFamily: 'Inter_400Regular',
          fontWeight: '400' as const
        },
        medium: {
          fontFamily: 'Inter_500Medium',
          fontWeight: '500' as const
        },
        bold: {
          fontFamily: 'Inter_700Bold',
          fontWeight: '700' as const
        },
        heavy: {
          fontFamily: 'Inter_800Heavy',
          fontWeight: '800' as const
        }
      },
      dark: isDarkColorScheme,
      colors: isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light
    }),
    [isDarkColorScheme]
  )

  useEffect(() => {
    const initialize = async () => {
      const theme = await AsyncStorage.getItem('theme')
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
      onMessage(messaging, async (remoteMessage) => {
        console.log(remoteMessage)
      })
      onNotificationOpenedApp(messaging, async (remoteMessage) => {
        if (remoteMessage?.data?.type === 'newFollower') {
          router.navigate(`/user/(stacks)/${remoteMessage.data.userId}`)
        } else if (remoteMessage?.data?.type === 'newMessage') {
          router.navigate(`/chat/${remoteMessage.data.userId}`)
        }
      })
      requestUserPermission().then()
      onTokenRefresh(messaging, async (newFcmToken) => {
        if (!newFcmToken) return
        await AsyncStorage.setItem('fcmToken', newFcmToken)
        await updatePushTargetWithAppwrite(newFcmToken)
      })
    }
    handleMessaging().then()
  }, [router])

  useEffect(() => {
    const getEulaVersion = async () => {
      try {
        const data = await databases.getDocument('config', 'legal', 'eula')
        const eula = await AsyncStorage.getItem('eula')
        if (eula !== data.version) {
          const allKeys = await AsyncStorage.getAllKeys()
          const eulaKeys = allKeys.filter((key) => key.startsWith('eula'))
          await AsyncStorage.multiRemove(eulaKeys)
          setVersionData(data)
          setOpenEulaModal(true)
        }
      } catch (error) {
        captureException(error)
      }
    }
    if (isMounted) {
      getEulaVersion().then()
      bootstrap(messaging).then()
    }
  }, [isMounted])

  if (!isColorSchemeLoaded) {
    return null
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={theme}>
        <NotifierWrapper>
          <UserProvider>
            <CacheProvider>
              <LanguageProvider>
                <AlertModalProvider>
                  <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
                  <EulaModal
                    isOpen={openEulaModal}
                    setOpen={setOpenEulaModal}
                    versionData={versionData}
                  />
                  <LocationProvider>
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
                              gestureEnabled: screen.swipeEnabled
                            }}
                          />
                        ))}
                      </Stack>
                    </BottomSheetModalProvider>
                  </LocationProvider>
                  <PortalHost />
                </AlertModalProvider>
              </LanguageProvider>
            </CacheProvider>
          </UserProvider>
        </NotifierWrapper>
      </ThemeProvider>
    </GestureHandlerRootView>
  )
}

async function bootstrap(messaging) {
  const initialNotification = await getInitialNotification(messaging)
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
