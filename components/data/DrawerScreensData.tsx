import { useColorScheme } from '~/lib/useColorScheme'
import { View } from 'react-native'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { ArrowLeftIcon, PlusIcon } from 'lucide-react-native'
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
    headerShown: true,
  },
  {
    location: 'announcements/(stacks)',
    title: 'Announcements',
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'gallery/(stacks)',
    title: 'Gallery',
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <GalleryAddButton />,
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
    location: 'user/(stacks)',
    title: 'Users',
    headerShown: false,
  },
  {
    location: 'notifications/index',
    title: 'Notifications',
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'relationships',
    title: 'Connections',
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
    location: 'account/(stacks)',
    title: 'My Account',
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
    title: 'Oops!',
  },
]
