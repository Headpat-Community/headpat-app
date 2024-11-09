import { Image, TouchableOpacity, View } from 'react-native'
import { useCallback, useMemo, useRef } from 'react'
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { useColorScheme } from '~/lib/useColorScheme'
import { Button } from '~/components/ui/button'
import {
  BadgeHelpIcon,
  BellIcon,
  BoxesIcon,
  CalendarIcon,
  FileCheckIcon,
  HomeIcon,
  LanguagesIcon,
  LayoutPanelLeftIcon,
  LogInIcon,
  MapPinnedIcon,
  MegaphoneIcon,
  MenuIcon,
  MessagesSquareIcon,
  PencilIcon,
  UserIcon,
  UserSearchIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react-native'
import { useUser } from '~/components/contexts/UserContext'
import { Text } from '~/components/ui/text'
import { DrawerItem } from '@react-navigation/drawer'
import { Link, router } from 'expo-router'
import { Separator } from '~/components/ui/separator'
import { MoonStar, Sun } from '~/components/Icons'
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar'
import AsyncStorage from '@react-native-async-storage/async-storage'
import DiscordIcon from '~/components/icons/DiscordIcon'
import { Muted } from '~/components/ui/typography'
import * as React from 'react'
import * as WebBrowser from 'expo-web-browser'

export function HeaderMenuSidebar() {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const snapPoints = useMemo(() => ['100%'], [])
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'

  return (
    <View className={'flex-row items-center'}>
      <TouchableOpacity
        // Just to make sure the icon is clickable
        style={{ paddingRight: 10, paddingVertical: 10 }}
        onPress={handlePresentModalPress}
      >
        <MenuIcon size={20} color={theme} />
      </TouchableOpacity>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        stackBehavior={'replace'}
        detached={true}
        enableOverDrag={false}
        enableHandlePanningGesture={false}
        enableDynamicSizing={false}
        handleStyle={{ display: 'none' }}
        backgroundStyle={{
          backgroundColor: isDarkColorScheme ? 'hsl(0 0% 7%)' : '#fff',
        }}
      >
        <CustomDrawerContent bottomSheetModalRef={bottomSheetModalRef} />
      </BottomSheetModal>
    </View>
  )
}

function CustomDrawerContent({ bottomSheetModalRef }) {
  const { isDarkColorScheme, setColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const { current } = useUser()

  const openBrowser = async (url: string) => {
    await WebBrowser.openBrowserAsync(url)
  }

  const handleNavigation = useCallback(
    ({ route, params = {} }) => {
      router.navigate({ pathname: route, params })
      bottomSheetModalRef.current?.dismiss()
    },
    [bottomSheetModalRef]
  )

  return (
    <>
      <View
        style={{
          marginTop: 60,
          justifyContent: 'center',
          alignItems: 'center',
          borderBottomColor: '#aaa',
          borderBottomWidth: 1,
        }}
      >
        <TouchableOpacity
          style={{ position: 'absolute', top: 20, right: 30, zIndex: 1 }}
          onPress={() => bottomSheetModalRef.current?.dismiss()}
        >
          <XIcon size={20} color={theme} />
        </TouchableOpacity>
        <Image
          source={require('../../assets/images/headpat_logo.png')}
          style={{ height: 90, width: 90, borderRadius: 65, marginBottom: 10 }}
        />
        <Text style={{ color: theme, marginBottom: 20 }}>
          Headpat Community
        </Text>
      </View>

      <BottomSheetScrollView>
        <DrawerItem
          label={() => (
            <DrawerLabel icon={HomeIcon} text="Home" theme={theme} />
          )}
          onPress={() => handleNavigation({ route: '/' })}
        />
        <DrawerItem
          label={() => (
            <DrawerLabel icon={MessagesSquareIcon} text="Chat" theme={theme} />
          )}
          onPress={() => handleNavigation({ route: '/chat/list' })}
        />
        <DrawerItem
          label={() => (
            <DrawerLabel
              icon={LayoutPanelLeftIcon}
              text="Gallery"
              theme={theme}
            />
          )}
          onPress={() => handleNavigation({ route: '/gallery/(stacks)' })}
        />
        <DrawerItem
          label={() => (
            <DrawerLabel icon={MapPinnedIcon} text="Locations" theme={theme} />
          )}
          onPress={() => handleNavigation({ route: '/locations' })}
        />
        <DrawerItem
          label={() => (
            <DrawerLabel
              icon={MegaphoneIcon}
              text="Announcements"
              theme={theme}
            />
          )}
          onPress={() => handleNavigation({ route: '/announcements' })}
        />
        <DrawerItem
          label={() => (
            <DrawerLabel icon={CalendarIcon} text="Events" theme={theme} />
          )}
          onPress={() => handleNavigation({ route: '/events/(tabs)' })}
        />
        <DrawerItem
          label={() => (
            <DrawerLabel icon={UserSearchIcon} text="Users" theme={theme} />
          )}
          onPress={() => handleNavigation({ route: '/user/(stacks)' })}
        />
        <Separator />
        {current && (
          <>
            <DrawerItem
              label={() => (
                <DrawerLabel
                  icon={BellIcon}
                  text="Notifications"
                  theme={theme}
                />
              )}
              onPress={() => handleNavigation({ route: '/notifications' })}
            />
            <DrawerItem
              label={() => (
                <DrawerLabel icon={UserIcon} text="My Profile" theme={theme} />
              )}
              onPress={() =>
                handleNavigation({
                  route: '/user/(stacks)/[userId]',
                  params: { userId: current.$id },
                })
              }
            />
            <DrawerItem
              label={() => (
                <DrawerLabel icon={UsersIcon} text="Mutuals" theme={theme} />
              )}
              onPress={() =>
                handleNavigation({ route: '/relationships/mutuals' })
              }
            />
          </>
        )}
        <DrawerItem
          label={() => (
            <DrawerLabel icon={BoxesIcon} text="Communities" theme={theme} />
          )}
          onPress={() => handleNavigation({ route: '/community' })}
        />
        <View style={{ flex: 1, flexGrow: 1 }}></View>
        <Separator />
        <DrawerItem
          label={() => (
            <DrawerLabel
              icon={isDarkColorScheme ? MoonStar : Sun}
              text="Switch theme"
              theme={theme}
            />
          )}
          onPress={() => {
            const newTheme = isDarkColorScheme ? 'light' : 'dark'
            setColorScheme(newTheme)
            setAndroidNavigationBar(newTheme).then()
            AsyncStorage.setItem('theme', newTheme).then()
          }}
        />
        <DrawerItem
          label={() => (
            <DrawerLabel
              icon={LogInIcon}
              text={current ? 'Account' : 'Login'}
              theme={theme}
            />
          )}
          onPress={() =>
            handleNavigation({ route: current ? '/account' : '/login' })
          }
        />
        <DrawerItem
          label={() => (
            <DrawerLabel
              icon={LanguagesIcon}
              text={'Change language'}
              theme={theme}
            />
          )}
          onPress={() => handleNavigation({ route: '/languages' })}
        />
        <Separator />
        <DrawerItem
          label={() => (
            <DrawerLabel icon={FileCheckIcon} text="Legal" theme={theme} />
          )}
          onPress={() => openBrowser('https://headpat.place/legal')}
        />
        <DrawerItem
          label={() => (
            <DrawerLabel icon={BadgeHelpIcon} text="Support" theme={theme} />
          )}
          onPress={() => openBrowser('https://headpat.place/support')}
        />
        <DrawerItem
          label={() => (
            <DrawerLabel icon={PencilIcon} text="Changelog" theme={theme} />
          )}
          onPress={() => handleNavigation({ route: '/changelog' })}
        />
        <Separator />
        <Link
          href={'https://discord.com/invite/EaQTEKRg2A'}
          target={'_blank'}
          asChild
        >
          <Button
            style={{
              backgroundColor: 'transparent',
              flexDirection: 'row',
              alignItems: 'center',
            }}
            variant={'ghost'}
          >
            <DiscordIcon size={20} color={theme} />
            <Text style={{ color: theme, marginLeft: 8 }}>Discord</Text>
          </Button>
        </Link>
        <Separator />
        <Text style={{ color: theme, padding: 10, textAlign: 'center' }}>
          Headpat App v0.8.2
        </Text>
        <Muted style={{ textAlign: 'center', paddingBottom: 16 }}>BETA</Muted>
      </BottomSheetScrollView>
    </>
  )
}

const DrawerLabel = ({ icon: Icon, text, theme }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingLeft: 12,
    }}
  >
    <Icon size={20} color={theme} />
    <Text style={{ color: theme }}>{text}</Text>
  </View>
)
