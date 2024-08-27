import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  DrawerActions,
  Theme,
  ThemeProvider,
  useNavigation,
} from '@react-navigation/native'
import { PortalHost } from '~/components/primitives/portal'
import { ToastProvider } from '~/components/primitives/deprecated-ui/toast'
import { router, SplashScreen, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Alert, BackHandler, ScrollView, Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ProfileThemeToggle } from '~/components/ThemeToggle'
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar'
import { NAV_THEME } from '~/lib/constants'
import { useColorScheme } from '~/lib/useColorScheme'
import { Drawer } from '~/components/Drawer'
import { DrawerItem } from '@react-navigation/drawer'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { Image } from 'expo-image'
import {
  BoxesIcon,
  CalendarIcon,
  HomeIcon,
  LayoutPanelLeftIcon,
  LogInIcon,
  MapPinnedIcon,
  MegaphoneIcon,
  MenuIcon,
  UserIcon,
  UserSearchIcon,
  UsersIcon,
} from 'lucide-react-native'
import {
  updatePushTargetWithAppwrite,
  UserProvider,
  useUser,
} from '~/components/contexts/UserContext'
import { DrawerScreensData } from '~/components/data/DrawerScreensData'
import { Separator } from '~/components/ui/separator'
import { MoonStar, Sun } from '~/components/Icons'
import * as TaskManager from 'expo-task-manager'
import * as BackgroundFetch from 'expo-background-fetch'
import * as Location from 'expo-location'
import { database } from '~/lib/appwrite-client'
import { toast } from '~/lib/toast'
import messaging from '@react-native-firebase/messaging'
import { requestUserPermission } from '~/components/system/pushNotifications'
import { AlertModalProvider } from '~/components/contexts/AlertModalProvider'

TaskManager.defineTask('background-location-task', async ({ data, error }) => {
  if (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed
  }

  // Use the user data from the task
  const userId = await AsyncStorage.getItem('userId')
  console.log('userId', userId)

  if (!userId) {
    return BackgroundFetch.BackgroundFetchResult.Failed
  }

  // Get current location
  const location = await Location.getCurrentPositionAsync({})

  // Make API calls to update or create location document
  await database
    .updateDocument('hp_db', 'locations', userId, {
      long: location.coords.longitude,
      lat: location.coords.latitude,
    })
    .catch(async () => {
      await database.createDocument('hp_db', 'locations', userId, {
        long: location.coords.longitude,
        lat: location.coords.latitude,
        timeUntilEnd: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
    })
})

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
  initialRouteName: 'index',
}

// Prevent the splash screen from auto-hiding before getting the color scheme.
SplashScreen.preventAutoHideAsync()

function HeaderMenuSidebar() {
  const navigation = useNavigation()

  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'

  const openMenu = () => {
    navigation.dispatch(DrawerActions.openDrawer())
  }

  return (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={openMenu} className={'p-5'}>
        <MenuIcon
          aria-label={'Menu'}
          size={20}
          color={theme}
          onPress={() => openMenu}
        />
      </TouchableOpacity>
    </View>
  )
}

// TODO: Proper TS types
function CustomDrawerContent() {
  // const insets = useSafeAreaInsets();
  // const router = useRouter();

  const { isDarkColorScheme, setColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const { current } = useUser()

  return (
    <>
      <View
        style={{
          height: 200,
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          borderBottomColor: '#aaa',
          borderBottomWidth: 1,
        }}
      >
        <Image
          source={require('../assets/images/headpat_logo.png')}
          style={{
            height: 90,
            width: 90,
            borderRadius: 65,
            marginBottom: 10,
          }}
        />
        <Text style={{ color: theme }}>Headpat Community</Text>
      </View>

      <ScrollView>
        <DrawerItem
          label={() => {
            return (
              <View className="flex-row items-center gap-3 pl-3">
                <HomeIcon size={20} color={theme} />
                <Text style={{ color: theme }}>Home</Text>
              </View>
            )
          }}
          onPress={() => router.navigate('/')}
        />

        <DrawerItem
          label={() => {
            return (
              <View className="flex-row items-center gap-3 pl-3">
                <LayoutPanelLeftIcon size={20} color={theme} />
                <Text style={{ color: theme }}>Gallery</Text>
              </View>
            )
          }}
          onPress={() => router.navigate('/gallery')}
        />

        <DrawerItem
          label={() => {
            return (
              <View className="flex-row items-center gap-3 pl-3">
                <MapPinnedIcon size={20} color={theme} />
                <Text style={{ color: theme }}>Locations</Text>
              </View>
            )
          }}
          onPress={() => router.navigate('/locations')}
        />

        <DrawerItem
          label={() => {
            return (
              <View className="flex-row items-center gap-3 pl-3">
                <MegaphoneIcon size={20} color={theme} />
                <Text style={{ color: theme }}>Announcements</Text>
              </View>
            )
          }}
          onPress={() => router.navigate('/announcements/(stacks)')}
        />

        <DrawerItem
          label={() => {
            return (
              <View className="flex-row items-center gap-3 pl-3">
                <CalendarIcon size={20} color={theme} />
                <Text style={{ color: theme }}>Events</Text>
              </View>
            )
          }}
          onPress={() => router.navigate('/events')}
        />

        <DrawerItem
          label={() => {
            return (
              <View className="flex-row items-center gap-3 pl-3">
                <UserSearchIcon size={20} color={theme} />
                <Text style={{ color: theme }}>Users</Text>
              </View>
            )
          }}
          onPress={() => router.navigate('/user/list')}
        />

        <Separator />

        {current && (
          <>
            <DrawerItem
              label={() => {
                return (
                  <View className="flex-row items-center gap-3 pl-3">
                    <UserIcon size={20} color={theme} />
                    <Text style={{ color: theme }}>My Profile</Text>
                  </View>
                )
              }}
              onPress={() => {
                router.navigate({
                  pathname: '/profile/[userId]',
                  params: { userId: current.$id },
                })
              }}
            />

            <DrawerItem
              label={() => {
                return (
                  <View className="flex-row items-center gap-3 pl-3">
                    <UsersIcon size={20} color={theme} />
                    <Text style={{ color: theme }}>Mutuals</Text>
                  </View>
                )
              }}
              onPress={() => router.navigate('/relationships/mutuals')}
            />
          </>
        )}

        <DrawerItem
          label={() => {
            return (
              <View className="flex-row items-center gap-3 pl-3">
                <BoxesIcon size={20} color={theme} />
                <Text style={{ color: theme }}>Communities</Text>
              </View>
            )
          }}
          onPress={() => router.navigate('/community/list')}
        />

        <View style={{ flex: 1, flexGrow: 1 }}></View>
        <Separator />
        <DrawerItem
          label={() => {
            return (
              <View className="flex-row items-center gap-3 pl-3">
                {isDarkColorScheme ? (
                  <MoonStar
                    className="text-foreground"
                    size={23}
                    strokeWidth={1.25}
                  />
                ) : (
                  <Sun
                    className="text-foreground"
                    size={24}
                    strokeWidth={1.25}
                  />
                )}
                <Text style={{ color: theme }}>Switch theme</Text>
              </View>
            )
          }}
          onPress={() => {
            const newTheme = isDarkColorScheme ? 'light' : 'dark'
            setColorScheme(newTheme)
            setAndroidNavigationBar(newTheme).then()
            AsyncStorage.setItem('theme', newTheme).then()
          }}
        />

        <DrawerItem
          label={() => {
            return (
              <View className="flex-row items-center gap-3 pl-3">
                <LogInIcon size={20} color={theme} />
                <Text style={{ color: theme }}>
                  {current ? 'Account' : 'Login'}
                </Text>
              </View>
            )
          }}
          onPress={() => {
            // eslint-disable-next-line no-unused-expressions
            current ? router.navigate('/account') : router.navigate('/login')
          }}
        />
        <Separator />
        <Text
          style={{
            color: theme,
            padding: 10,
            paddingBottom: 16,
            textAlign: 'center',
          }}
        >
          Headpat App v0.6.0
        </Text>
      </ScrollView>
    </>
  )
}

export default function RootLayout() {
  const { colorScheme, setColorScheme, isDarkColorScheme } = useColorScheme()
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false)
  const [lastBackPressed, setLastBackPressed] = useState(0)

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
    })
  }, [colorScheme, setColorScheme])

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
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage))
    })
  }, [])

  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Message handled in the background!', remoteMessage)
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

  if (!isColorSchemeLoaded) {
    return null
  }

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <UserProvider>
        <AlertModalProvider>
          <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer
              drawerContent={(props) => {
                return <CustomDrawerContent />
              }}
              initialRouteName={'index'}
              screenOptions={{
                drawerStyle: {},
                swipeEdgeWidth: 50,
                headerShown: segments[2] === '[eventId]' ? false : true,
              }}
            >
              {/* <Image
               className=""
               source={require('assets/images/headpat_logo.png')}
               // placeholder={blurhash}
               contentFit="cover"
               // transition={1000}
               allowDownscaling={true}
               style={{ width: 200, height: 200, marginTop: 20 }}
               /> */}

              {DrawerScreensData.map((screen) => (
                <Drawer.Screen
                  key={screen.location}
                  name={screen.location}
                  options={{
                    drawerLabel: screen.title,
                    title: screen.title,
                    headerTitleAlign: 'left',
                    headerLeft: () =>
                      screen.headerLeft || <HeaderMenuSidebar />,
                    headerRight: () =>
                      screen.headerRight || <ProfileThemeToggle />,
                  }}
                />
              ))}
            </Drawer>
          </GestureHandlerRootView>
          <PortalHost />
          <ToastProvider />
        </AlertModalProvider>
      </UserProvider>
    </ThemeProvider>
  )
}
