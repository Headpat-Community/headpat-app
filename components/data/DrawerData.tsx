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
  MoonStarIcon,
  PencilIcon,
  SunIcon,
  UserIcon,
  UserSearchIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react-native'
import { useUser } from '~/components/contexts/UserContext'
import { Text } from '~/components/ui/text'
import { Link, router } from 'expo-router'
import { Separator } from '~/components/ui/separator'
import kv from 'expo-sqlite/kv-store'
import DiscordIcon from '~/components/icons/DiscordIcon'
import { Muted } from '~/components/ui/typography'
import * as React from 'react'
import * as WebBrowser from 'expo-web-browser'
import { i18n } from '~/components/system/i18n'

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
        <DrawerLabel
          icon={HomeIcon}
          text="Home"
          theme={theme}
          route={'/'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <DrawerLabel
          icon={LayoutPanelLeftIcon}
          text="Gallery"
          theme={theme}
          route={'/gallery/(stacks)'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <DrawerLabel
          icon={MapPinnedIcon}
          text="Locations"
          theme={theme}
          route={'/locations'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <DrawerLabel
          icon={CalendarIcon}
          text="Events"
          theme={theme}
          route={'/events/(tabs)'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <DrawerLabel
          icon={MegaphoneIcon}
          text="Announcements"
          theme={theme}
          route={'/announcements'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <DrawerLabel
          icon={UserSearchIcon}
          text="Users"
          theme={theme}
          route={'/user/(stacks)'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <DrawerLabel
          icon={BoxesIcon}
          text="Communities"
          theme={theme}
          route={'/community'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <Separator />
        {current && (
          <>
            <DrawerLabel
              icon={MessagesSquareIcon}
              text="Chat"
              theme={theme}
              route={'/chat/list'}
              bottomSheetModalRef={bottomSheetModalRef}
            />
            <DrawerLabel
              icon={BellIcon}
              text="Notifications"
              theme={theme}
              route={'/notifications'}
              bottomSheetModalRef={bottomSheetModalRef}
            />
            <DrawerLabel
              icon={UserIcon}
              text="My Profile"
              theme={theme}
              route={'/user/(stacks)/[userId]'}
              bottomSheetModalRef={bottomSheetModalRef}
            />
            <DrawerLabel
              icon={UsersIcon}
              text="Mutuals"
              theme={theme}
              route={'/relationships/mutuals'}
              bottomSheetModalRef={bottomSheetModalRef}
            />
          </>
        )}
        <Separator />
        <DrawerLabel
          icon={isDarkColorScheme ? MoonStarIcon : SunIcon}
          text="Switch theme"
          theme={theme}
          route={'/theme'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <DrawerLabel
          icon={LogInIcon}
          text={current ? 'Account' : 'Login'}
          theme={theme}
          route={current ? '/account' : '/login'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <DrawerLabel
          icon={LanguagesIcon}
          text={'Change language'}
          theme={theme}
          route={'/languages'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <Separator />
        <DrawerLabel
          icon={FileCheckIcon}
          text="Legal"
          theme={theme}
          route={'https://headpat.place/legal'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <DrawerLabel
          icon={BadgeHelpIcon}
          text="Support"
          theme={theme}
          route={'https://headpat.place/support'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <DrawerLabel
          icon={PencilIcon}
          text="Changelog"
          theme={theme}
          route={'/changelog'}
          bottomSheetModalRef={bottomSheetModalRef}
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
          Headpat App v0.8.3
        </Text>
        <Muted style={{ textAlign: 'center', paddingBottom: 16 }}>BETA</Muted>
      </BottomSheetScrollView>
    </>
  )
}

const DrawerLabel = ({
  icon: Icon,
  text,
  theme,
  route,
  bottomSheetModalRef,
}) => {
  const handleNavigation = useCallback(
    ({ route, params = {} }) => {
      router.navigate({ pathname: route, params })
      bottomSheetModalRef.current?.dismiss()
    },
    [bottomSheetModalRef]
  )

  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        paddingLeft: 20,
      }}
      onPress={() => handleNavigation({ route })}
    >
      <Icon size={20} color={theme} />
      <Text style={{ color: theme }}>{text}</Text>
    </TouchableOpacity>
  )
}
