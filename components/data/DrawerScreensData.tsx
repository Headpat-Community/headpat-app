import { useColorScheme } from '~/lib/useColorScheme'
import { View } from 'react-native'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { ArrowLeftIcon, PlusIcon } from 'lucide-react-native'
import * as React from 'react'
import { router } from 'expo-router'
import { ProfileThemeToggle } from '~/components/ThemeToggle'

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
  // Add button to add a new gallery
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'

  return (
    <>
      <View className={'items-center flex-row'}>
        <View>
          <TouchableOpacity>
            <PlusIcon aria-label={'Add gallery item'} size={20} color={theme} />
          </TouchableOpacity>
        </View>
        <View>
          <ProfileThemeToggle />
        </View>
      </View>
    </>
  )
}

export const DrawerScreensData = [
  {
    location: '+not-found',
    title: 'Not Found',
  },
  {
    location: 'index',
    title: 'Home',
  },
  {
    location: 'announcements/index',
    title: 'Announcements',
  },
  {
    location: 'announcements/[announcementId]/index',
    title: 'Announcement',
  },
  {
    location: 'gallery/index',
    title: 'Gallery',
    headerLeft: <GalleryAddButton />,
  },
  {
    location: 'gallery/[galleryId]/index',
    title: 'Gallery',
  },
  {
    location: 'friends/(tabs)',
    title: 'Friends',
  },
  {
    location: 'communities/index',
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
  },
  {
    location: 'user/[userId]/index',
    title: 'Profile',
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
  },
  {
    location: 'account/userprofile/index',
    title: 'User Profile',
  },
  {
    location: 'account/security/index',
    title: 'Security',
  },
  {
    location: '(tabs)',
    title: 'Tabs',
  },
  {
    location: 'material-top-tabs',
    title: 'Material Top Tabs',
  },
]
