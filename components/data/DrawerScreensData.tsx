import { useColorScheme } from '~/lib/useColorScheme'
import { View } from 'react-native'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { ArrowLeftIcon, HomeIcon, PlusIcon } from 'lucide-react-native'
import * as React from 'react'
import { router } from 'expo-router'
import { ProfileThemeToggle } from '~/components/ThemeToggle'
import { useUser } from '~/components/contexts/UserContext'
import { DrawerProps } from '~/app/_layout'

export function HeaderSidebarBackButton() {
  // Back button to go back to the previous screen
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'

  return (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          padding: 10,
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
    title: 'Home',
  },
  {
    location: 'announcements/index',
    title: 'Announcements',
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
    title: 'Gallery',
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <GalleryAddButton />,
  },
  {
    location: 'gallery/(stacks)/add/index',
    title: 'Gallery',
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <GalleryAddButton />,
  },
  {
    location: 'gallery/(stacks)/[galleryId]/index',
    title: 'Gallery',
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <GalleryAddButton />,
  },
  {
    location: 'gallery/(stacks)/[galleryId]/edit',
    title: 'Gallery',
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
  {
    location: 'locations/(tabs)',
    title: 'Locations',
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'community',
    title: 'Communities',
    headerShown: false,
  },
  {
    location: 'events/(tabs)',
    title: 'Events',
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'user/(stacks)/index',
    title: 'Users',
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
    title: 'Followers',
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
  {
    location: 'user/(stacks)/[userId]/relationships/following/index',
    title: 'Following',
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
  {
    location: 'notifications/index',
    title: 'Notifications',
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
  {
    location: 'login/index',
    title: 'Login',
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
  {
    location: 'register/index',
    title: 'Register',
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
  {
    location: 'account/(stacks)',
    title: 'My Account',
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'relationships',
    title: 'Connections',
    headerShown: false,
  },
  {
    location: 'changelog/index',
    title: 'Changelog',
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: '+not-found',
    title: 'Oops!',
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
]

export const DrawerScreensTabsData: DrawerProps[] = [
  {
    location: 'relationships/mutuals',
    title: 'Connections',
    headerShown: true,
  },
]
