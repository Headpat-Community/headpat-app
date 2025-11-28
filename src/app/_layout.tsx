import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  type FirebaseMessagingTypes,
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
} from '@react-native-firebase/messaging'
import { ThemeProvider } from '@react-navigation/native'
import { captureException } from '@sentry/react-native'
import { router, SplashScreen, Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GTProvider } from 'gt-react-native'
import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { BackHandler, Platform, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { NotifierWrapper } from 'react-native-notifier'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { AlertModalProvider } from '~/components/contexts/AlertModalProvider'
import CacheProvider from '~/components/contexts/cacheProvider'
import { LanguageProvider } from '~/components/contexts/LanguageProvider'
import { LocationProvider } from '~/components/contexts/SharingContext'
import { updatePushTargetWithAppwrite, UserProvider } from '~/components/contexts/UserContext'
import { HeaderMenuSidebar } from '~/components/data/DrawerData'
import { DrawerScreensData } from '~/components/data/DrawerScreensData'
import { PortalHost } from '~/components/primitives/portal'
import EulaModal from '~/components/system/EulaModal'
import { requestUserPermission } from '~/components/system/pushNotifications'
import { ProfileThemeToggle } from '~/components/ThemeToggle'
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar'
import { databases } from '~/lib/appwrite-client'
import { NAV_THEME } from '~/lib/constants'
import { toast } from '~/lib/toast'
import { useColorScheme } from '~/lib/useColorScheme'
import '../components/init/sentryInit'
import '../components/system/backgroundTasks'
import '../global.css'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: 'index',
}

void SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme()
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false)
  const [lastBackPressed, setLastBackPressed] = useState(0)
  const [openEulaModal, setOpenEulaModal] = useState(false)
  const [versionData, setVersionData] = useState<any>(null)
  const [isMounted, setIsMounted] = useState(false)
  const messaging = getMessaging()
  const insets = useSafeAreaInsets()

  const theme = useMemo(
    () => ({
      fonts: {
        regular: {
          fontFamily: 'Inter_400Regular',
          fontWeight: '400' as const,
        },
        medium: {
          fontFamily: 'Inter_500Medium',
          fontWeight: '500' as const,
        },
        bold: {
          fontFamily: 'Inter_700Bold',
          fontWeight: '700' as const,
        },
        heavy: {
          fontFamily: 'Inter_800Heavy',
          fontWeight: '800' as const,
        },
      },
      dark: isDarkColorScheme,
      colors: isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light,
    }),
    [isDarkColorScheme],
  )

  useEffect(() => {
    const initialize = async () => {
      const theme = await AsyncStorage.getItem('theme')
      const colorTheme = theme === 'dark' ? 'dark' : 'light'
      await setAndroidNavigationBar(colorTheme)
      if (colorTheme !== colorScheme) {
        void setColorScheme(colorTheme)
      }
      setIsColorSchemeLoaded(true)
      await SplashScreen.hideAsync()
      setIsMounted(true)
    }
    void initialize()
  }, [colorScheme, setColorScheme])

  const router = useRouter()
  const segments = useSegments()
  useEffect(() => {
    const backAction = () => {
      const now = Date.now()
      if (segments[0] !== 'index') {
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

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction)
    return () => backHandler.remove()
  }, [router, segments, lastBackPressed])

  useEffect(() => {
    const handleMessaging = () => {
      onMessage(messaging, (remoteMessage) => {
        console.log(remoteMessage)
      })
      onNotificationOpenedApp(messaging, (remoteMessage) => {
        if (remoteMessage.data?.type === 'newFollower') {
          router.navigate(`/user/(stacks)/${remoteMessage.data.userId as string}`)
        } else if (remoteMessage.data?.type === 'newMessage') {
          router.navigate(`/chat/${remoteMessage.data.userId as string}`)
        }
      })
      void requestUserPermission()
      onTokenRefresh(messaging, (newFcmToken) => {
        if (!newFcmToken) return
        void AsyncStorage.setItem('fcmToken', newFcmToken)
        void updatePushTargetWithAppwrite(newFcmToken)
      })
    }
    handleMessaging()
  }, [router, messaging])

  useEffect(() => {
    const getEulaVersion = async () => {
      try {
        const data = await databases.getRow({
          databaseId: 'config',
          tableId: 'legal',
          rowId: 'eula',
        })
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
      void getEulaVersion()
      void bootstrap(messaging)
    }
  }, [isMounted, messaging])

  if (!isColorSchemeLoaded) {
    return null
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider value={theme}>
          <GTProvider>
            <UserProvider>
              <CacheProvider>
                <LanguageProvider>
                  <AlertModalProvider>
                    <NotifierWrapper>
                      <EulaModal
                        isOpen={openEulaModal}
                        setOpen={setOpenEulaModal}
                        versionData={versionData}
                      />
                      <LocationProvider>
                        <BottomSheetModalProvider>
                          {Platform.OS === 'android' && (
                            <View style={{ flex: 1, paddingTop: insets.top }}>
                              <StatusBar
                                style={colorScheme === 'dark' ? 'light' : 'dark'}
                                backgroundColor={colorScheme === 'dark' ? '#000000' : '#ffffff'}
                              />
                              <Stack
                                screenOptions={{
                                  headerStyle: {
                                    backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
                                  },
                                  headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
                                  contentStyle: {
                                    backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
                                  },
                                }}
                              >
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
                                      headerLeft: () => screen.headerLeft ?? <HeaderMenuSidebar />,
                                      headerRight: () =>
                                        screen.headerRight ?? <ProfileThemeToggle />,
                                      gestureEnabled: screen.swipeEnabled,
                                    }}
                                  />
                                ))}
                              </Stack>
                            </View>
                          )}

                          {Platform.OS === 'ios' && (
                            <>
                              <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
                              <Stack
                                screenOptions={{
                                  headerStyle: {
                                    backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
                                  },
                                  headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
                                  contentStyle: {
                                    backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
                                  },
                                }}
                              >
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
                                      headerLeft: () => screen.headerLeft ?? <HeaderMenuSidebar />,
                                      headerRight: () =>
                                        screen.headerRight ?? <ProfileThemeToggle />,
                                      gestureEnabled: screen.swipeEnabled,
                                    }}
                                  />
                                ))}
                              </Stack>
                            </>
                          )}
                          <PortalHost />
                        </BottomSheetModalProvider>
                      </LocationProvider>
                    </NotifierWrapper>
                  </AlertModalProvider>
                </LanguageProvider>
              </CacheProvider>
            </UserProvider>
          </GTProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}

async function bootstrap(messaging: FirebaseMessagingTypes.Module) {
  const initialNotification = await getInitialNotification(messaging)
  if (initialNotification?.data?.type === 'newFollower') {
    router.navigate(`/user/(stacks)/${initialNotification.data.userId as string}`)
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
