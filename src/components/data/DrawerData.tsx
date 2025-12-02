import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { Link, router } from 'expo-router'
import { useTranslations } from 'gt-react-native'
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
import type * as React from 'react'
import { useCallback, useMemo, useRef } from 'react'
import { Image, TouchableOpacity, View } from 'react-native'
import { useUser } from '~/components/contexts/UserContext'
import DiscordIcon from '~/components/icons/DiscordIcon'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import { Text } from '~/components/ui/text'
import { Muted } from '~/components/ui/typography'
import { useColorScheme } from '~/lib/useColorScheme'

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

function CustomDrawerContent({
  bottomSheetModalRef,
}: {
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null>
}) {
  const { isDarkColorScheme, setColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const { current } = useUser()
  const t = useTranslations()
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
          source={
            isDarkColorScheme
              ? require('~/assets/logos/place_dark_x250.webp')
              : require('~/assets/logos/place_light_x250.webp')
          }
          style={{ height: 90, width: 250, marginBottom: 10 }}
        />
      </View>

      <BottomSheetScrollView>
        <DrawerLabel
          icon={HomeIcon}
          text={t('screens.home')}
          theme={theme}
          route={'/'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <DrawerLabel
          icon={LayoutPanelLeftIcon}
          text={t('screens.gallery')}
          theme={theme}
          route={'/gallery/(stacks)/(list)/newest'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <DrawerLabel
          icon={MapPinnedIcon}
          text={t('screens.locations')}
          theme={theme}
          route={'/locations'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <DrawerLabel
          icon={CalendarIcon}
          text={t('screens.events')}
          theme={theme}
          route={'/events/(tabs)'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <DrawerLabel
          icon={MegaphoneIcon}
          text={t('screens.announcements')}
          theme={theme}
          route={'/announcements'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <DrawerLabel
          icon={UserSearchIcon}
          text={t('screens.users')}
          theme={theme}
          route={'/user/(stacks)'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <DrawerLabel
          icon={BoxesIcon}
          text={t('screens.communities')}
          theme={theme}
          route={'/community'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <Separator />
        {current && (
          <>
            {current.labels.includes('staff') && (
              <DrawerLabel
                icon={MessagesSquareIcon}
                text={t('screens.chat')}
                theme={theme}
                route={'/chat/list'}
                bottomSheetModalRef={bottomSheetModalRef}
              />
            )}
            <DrawerLabel
              icon={BellIcon}
              text={t('screens.notifications')}
              theme={theme}
              route={'/notifications'}
              bottomSheetModalRef={bottomSheetModalRef}
            />
            <DrawerLabel
              icon={UserIcon}
              text={t('screens.myProfile')}
              theme={theme}
              route={`/user/(stacks)/${current.$id}`}
              bottomSheetModalRef={bottomSheetModalRef}
            />
            <DrawerLabel
              icon={UsersIcon}
              text={t('screens.mutuals')}
              theme={theme}
              route={'/relationships/mutuals'}
              bottomSheetModalRef={bottomSheetModalRef}
            />
          </>
        )}
        <Separator />
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            paddingLeft: 20,
          }}
          onPress={() => {
            const newTheme = isDarkColorScheme ? 'light' : 'dark'
            void setColorScheme(newTheme)
          }}
        >
          {isDarkColorScheme ? (
            <MoonStarIcon size={20} color={theme} />
          ) : (
            <SunIcon size={20} color={theme} />
          )}
          <Text style={{ color: theme }}>{t('drawer.switchTheme')}</Text>
        </TouchableOpacity>
        <DrawerLabel
          icon={LogInIcon}
          text={current ? t('screens.account') : t('screens.login')}
          theme={theme}
          route={current ? '/account' : '/login'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <DrawerLabel
          icon={LanguagesIcon}
          text={t('screens.changeLanguage')}
          theme={theme}
          route={'/languages'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <Separator />
        <DrawerLabel
          icon={FileCheckIcon}
          text={t('screens.legal')}
          theme={theme}
          route={'https://headpat.place/legal'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <DrawerLabel
          icon={BadgeHelpIcon}
          text={t('screens.support')}
          theme={theme}
          route={'https://headpat.place/support'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <DrawerLabel
          icon={PencilIcon}
          text={t('screens.changelog')}
          theme={theme}
          route={'/changelog'}
          bottomSheetModalRef={bottomSheetModalRef}
        />
        <Separator />
        <Link href={'https://discord.com/invite/EaQTEKRg2A'} target={'_blank'} asChild>
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
          Headpat Place v0.8.13
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
}: {
  icon: React.ComponentType<any>
  text: string
  theme: string
  route: string
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null>
}) => {
  const handleNavigation = useCallback(
    ({ route, params = {} }: { route: string; params?: any }) => {
      router.navigate({ pathname: route, params })
      bottomSheetModalRef.current?.dismiss()
    },
    [bottomSheetModalRef],
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
