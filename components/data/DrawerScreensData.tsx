import { useColorScheme } from '~/lib/useColorScheme'
import { View } from 'react-native'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { ArrowLeftIcon } from 'lucide-react-native'
import * as React from 'react'
import { router } from 'expo-router'

function HeaderSidebarBackButton() {
  // Back button to go back to the previous screen
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'

  return (
    <View style={{ paddingLeft: 16 }}>
      <TouchableOpacity onPress={() => router.back()}>
        <ArrowLeftIcon size={20} color={theme} />
      </TouchableOpacity>
    </View>
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
    location: 'login/index',
    title: 'Login',
  },
  {
    location: 'register/index',
    title: 'Register',
  },
  {
    location: 'account/index',
    title: 'Account',
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
    location: '(tabs)',
    title: 'Tabs',
  },
  {
    location: 'material-top-tabs',
    title: 'Material Top Tabs',
  },
]
