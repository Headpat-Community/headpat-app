import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  DrawerActions,
  Theme,
  ThemeProvider,
  useNavigation,
} from '@react-navigation/native'
import { PortalHost } from '~/components/primitives/portal'
import { ToastProvider } from '~/components/primitives/deprecated-ui/toast'
import { SplashScreen, Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as React from 'react'
import { Platform, ScrollView, Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { ProfileThemeToggle } from '~/components/ThemeToggle'
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar'
import { NAV_THEME } from '~/lib/constants'
import { useColorScheme } from '~/lib/useColorScheme'
import { Drawer } from 'expo-router/drawer'
import { DrawerItem } from '@react-navigation/drawer'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { Image } from 'expo-image'
import {
  CalendarIcon,
  HomeIcon,
  LayoutPanelLeftIcon,
  LogInIcon,
  MenuIcon,
} from 'lucide-react-native'
import { UserProvider, useUser } from '~/components/contexts/UserContext'
import { DrawerScreensData } from '~/components/data/DrawerScreensData'

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

function HeaderLeft() {
  const navigation = useNavigation()

  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'

  const openMenu = () => {
    navigation.dispatch(DrawerActions.openDrawer())
  }

  return (
    <View style={{ paddingLeft: 16 }}>
      <TouchableOpacity onPress={openMenu}>
        <MenuIcon size={20} color={theme} onPress={() => openMenu} />
      </TouchableOpacity>
    </View>
  )
}

// TODO: Proper TS types
function CustomDrawerContent({
  drawerPosition,
  props,
  navigation,
}: {
  drawerPosition: any
  props: any
  navigation: any
}) {
  // const insets = useSafeAreaInsets();
  // const router = useRouter();

  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const { current }: any = useUser()

  return (
    <ScrollView
      style={{ flex: 1, flexDirection: 'column', height: '100%' }}
      contentContainerStyle={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
      }}
    >
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

      {/* Horizontal Row with Icon and Text */}

      <DrawerItem
        label={() => {
          return (
            <View className="flex-row items-center gap-3 pl-3">
              <HomeIcon size={20} color={theme} />
              <Text style={{ color: theme }}>Home</Text>
            </View>
          )
        }}
        onPress={() => navigation.navigate('index')}
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
        onPress={() => navigation.navigate('gallery/index')}
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
        onPress={() => navigation.navigate('events/index')}
      />

      <View style={{ borderBottomColor: '#f4f4f4', borderBottomWidth: 1 }} />

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
          current
            ? navigation.navigate('account/index')
            : navigation.navigate('login/index')
        }}
      />

      <View
        style={{
          borderWidth: 1,
          borderColor: 'gray',
          margin: 20,
          marginTop: 50,
          padding: 10,
        }}
      >
        <Text
          style={{
            marginTop: -20,
            backgroundColor: 'white',
            width: 100,
            paddingHorizontal: 5,
          }}
        >
          Debug Pages
        </Text>
        <DrawerItem
          label="Tabs"
          onPress={() => navigation.navigate('(tabs)')}
        />
        <DrawerItem
          label="Material Top Tabs"
          onPress={() => navigation.navigate('material-top-tabs')}
        />
      </View>

      <View style={{ flex: 1, flexGrow: 1 }}></View>
      <View style={{ borderBottomColor: '#f4f4f4', borderBottomWidth: 1 }} />
      <Text style={{ color: theme, padding: 10, textAlign: 'center' }}>
        Headpat App v0.1.3
      </Text>
    </ScrollView>
  )
}

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
  }, [])

  if (!isColorSchemeLoaded) {
    return null
  }

  return (
    <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
      <UserProvider>
        <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Drawer
            drawerContent={(props) => {
              return (
                <CustomDrawerContent
                  props={undefined}
                  drawerPosition={undefined}
                  {...props}
                />
              )
            }}
            initialRouteName={'index'}
            screenOptions={{
              drawerType: 'slide',
              drawerStyle: {},
              swipeEdgeWidth: 100,
              headerLeft: () => <HeaderLeft />,
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
                  headerRight: () => <ProfileThemeToggle />,
                }}
              />
            ))}
          </Drawer>
        </GestureHandlerRootView>
        <PortalHost />
        <ToastProvider />
      </UserProvider>
    </ThemeProvider>
  )
}
