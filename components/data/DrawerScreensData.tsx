import { useColorScheme } from '~/lib/useColorScheme'
import { View } from 'react-native'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { ArrowLeftIcon, HomeIcon, PlusIcon } from 'lucide-react-native'
import * as React from 'react'
import { router } from 'expo-router'
import { ProfileThemeToggle } from '~/components/ThemeToggle'
import { useUser } from '~/components/contexts/UserContext'
import { DrawerProps } from '~/app/_layout'
import { i18n } from '~/components/system/i18n'

export function HeaderSidebarBackButton() {
  // Back button to go back to the previous screen
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'

  return (
    <View className={'items-center flex-row'}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          paddingVertical: 10,
          paddingRight: 10,
        }}
      >
        <ArrowLeftIcon aria-label={'Go back'} size={20} color={theme} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.navigate('/')}
        style={{
          padding: 10,
        }}
      >
        <HomeIcon aria-label={'Home'} size={20} color={theme} />
      </TouchableOpacity>
    </View>
  )
}

function GalleryAddButton() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'
  const { current } = useUser()
  return (
    <>
      <View className={'items-center flex-row'}>
        {current && (
          <TouchableOpacity
            onPress={() => router.navigate('/gallery/(stacks)/add')}
            className={'mr-4'}
          >
            <PlusIcon
              aria-label={'Add gallery item'}
              title={'Add gallery item'}
              size={20}
              color={theme}
            />
          </TouchableOpacity>
        )}
        <View>
          <ProfileThemeToggle />
        </View>
      </View>
    </>
  )
}

export const DrawerScreensData: DrawerProps[] = [
  {
    location: 'index',
    title: i18n.t('screens.home'),
  },
  {
    location: 'languages/index',
    title: i18n.t('screens.languages'),
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'chat/list',
    title: i18n.t('screens.conversations'),
    headerLeft: <HeaderSidebarBackButton />,
    headerShown: false,
  },
  {
    location: 'chat/[conversationId]/index',
    title: i18n.t('screens.chat'),
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'announcements/index',
    title: i18n.t('screens.announcements'),
    headerLargeTitle: true,
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'announcements/[announcementId]/index',
    title: '',
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'gallery/(stacks)/index',
    title: i18n.t('screens.gallery'),
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <GalleryAddButton />,
  },
  {
    location: 'gallery/(stacks)/add/index',
    title: i18n.t('screens.gallery'),
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <GalleryAddButton />,
  },
  {
    location: 'gallery/(stacks)/[galleryId]/index',
    title: i18n.t('screens.gallery'),
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <GalleryAddButton />,
  },
  {
    location: 'gallery/(stacks)/[galleryId]/edit',
    title: i18n.t('screens.gallery'),
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
  {
    location: 'locations',
    title: i18n.t('screens.locations'),
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'community',
    title: i18n.t('screens.communities'),
    headerShown: false,
  },
  {
    location: 'events/(tabs)',
    title: i18n.t('screens.events'),
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'user/(stacks)/index',
    title: i18n.t('screens.users'),
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
  {
    location: 'user/(stacks)/[userId]/index',
    title: '',
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
  {
    location: 'user/(stacks)/[userId]/relationships/followers/index',
    title: i18n.t('screens.followers'),
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
  {
    location: 'user/(stacks)/[userId]/relationships/following/index',
    title: i18n.t('screens.following'),
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
  {
    location: 'notifications/index',
    title: i18n.t('screens.notifications'),
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
  {
    location: 'login/index',
    title: i18n.t('screens.login'),
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
  {
    location: 'register/index',
    title: i18n.t('screens.register'),
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
  {
    location: 'account/(stacks)',
    title: i18n.t('screens.account'),
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'relationships',
    title: i18n.t('screens.connections'),
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'changelog/index',
    title: i18n.t('screens.changelog'),
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: '+not-found',
    title: 'Oops!',
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
]
