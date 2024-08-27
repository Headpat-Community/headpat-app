import { useColorScheme } from '~/lib/useColorScheme'
import { View } from 'react-native'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { ArrowLeftIcon, PlusIcon } from 'lucide-react-native'
import * as React from 'react'
import { router } from 'expo-router'
import { ProfileThemeToggle } from '~/components/ThemeToggle'
import { useUser } from '~/components/contexts/UserContext'

function HeaderSidebarBackButton() {
  // Back button to go back to the previous screen
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'

  return (
    <View style={{ paddingLeft: 16 }}>
      <TouchableOpacity onPress={() => router.back()}>
        <ArrowLeftIcon aria-label={'Go back'} size={20} color={theme} />
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
          <TouchableOpacity onPress={() => router.push('/gallery/add')}>
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

export const DrawerScreensData = [
  {
    location: 'index',
    title: 'Home',
  },
  {
    location: '+not-found',
    title: 'Not Found',
  },
  {
    location: 'announcements/index',
    title: 'Announcements',
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'announcements/[announcementId]/index',
    title: 'Announcement',
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'gallery/index',
    title: 'Gallery',
    headerRight: <GalleryAddButton />,
  },
  {
    location: 'gallery/[galleryId]/index',
    title: 'Gallery',
    headerRight: <GalleryAddButton />,
  },
  {
    location: 'gallery/add/index',
    title: 'Gallery',
  },
  {
    location: 'locations',
    title: 'Locations',
  },
  {
    location: 'community/list/index',
    title: 'Communities',
  },
  {
    location: 'events/(tabs)',
    title: 'Events',
  },
  {
    location: 'events/archived/index',
    title: 'Archived Events',
  },
  {
    location: 'events/[eventId]/index',
    title: 'Event',
  },
  {
    location: 'user/list/index',
    title: 'Users',
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'user/relationships',
    title: 'Users',
  },
  {
    location: 'user/[userId]/index',
    title: 'Profile',
  },
  {
    location: 'user/[userId]/relationships/followers/index',
    title: 'Followers',
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'user/[userId]/relationships/following/index',
    title: 'Following',
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'login/index',
    title: 'Login',
  },
  {
    location: 'register/index',
    title: 'Register',
  },
  {
    location: 'account/index',
    title: 'My Account',
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'account/userprofile/index',
    title: 'User Profile',
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'account/security/index',
    title: 'Security',
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: '(tabs)',
    title: 'Tabs',
  },
  {
    location: 'material-top-tabs',
    title: 'Material Top Tabs',
  },
  {
    location: '+not-found',
    title: 'Not Found',
  },
]
