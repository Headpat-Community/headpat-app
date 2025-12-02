import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { router } from 'expo-router'
import type { useTranslations } from 'gt-react-native'
import { ArrowLeftIcon, HomeIcon, PlusIcon } from 'lucide-react-native'
import { View } from 'react-native'
import type { DrawerProps } from '~/app/_layout'
import { useUser } from '~/components/contexts/UserContext'
import { ProfileThemeToggle } from '~/components/ThemeToggle'
import { useColorScheme } from '~/lib/useColorScheme'

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
        onPress={() => router.dismissAll()}
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
  )
}

export const DrawerScreensData = (t: ReturnType<typeof useTranslations>): DrawerProps[] => [
  {
    location: 'index',
    title: t('screens.home'),
    swipeEnabled: false,
  },
  {
    location: 'languages/index',
    title: t('screens.languages'),
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'chat/list',
    title: t('screens.conversations'),
    headerLeft: <HeaderSidebarBackButton />,
    headerShown: false,
  },
  {
    location: 'chat/[conversationId]/index',
    title: t('screens.chat'),
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'announcements/index',
    title: t('screens.announcements'),
    headerLargeTitle: true,
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'announcements/[announcementId]/index',
    title: '',
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'gallery/(stacks)/(list)',
    title: t('screens.gallery'),
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <GalleryAddButton />,
  },
  {
    location: 'gallery/(stacks)/add/index',
    title: t('screens.gallery'),
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <GalleryAddButton />,
  },
  {
    location: 'gallery/(stacks)/[galleryId]/index',
    title: t('screens.gallery'),
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <GalleryAddButton />,
  },
  {
    location: 'gallery/(stacks)/[galleryId]/edit',
    title: t('screens.gallery'),
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
  {
    location: 'locations',
    title: t('screens.locations'),
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'community',
    title: t('screens.communities'),
    headerShown: false,
  },
  {
    location: 'events/(tabs)',
    title: t('screens.events'),
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'user/(stacks)/index',
    title: t('screens.users'),
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
    title: t('screens.followers'),
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
  {
    location: 'user/(stacks)/[userId]/relationships/following/index',
    title: t('screens.following'),
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
  {
    location: 'notifications/index',
    title: t('screens.notifications'),
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
  {
    location: 'login/index',
    title: t('screens.login'),
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
  {
    location: 'register/index',
    title: t('screens.register'),
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
  {
    location: 'account/(stacks)',
    title: t('screens.account'),
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'relationships',
    title: t('screens.connections'),
    headerLeft: <HeaderSidebarBackButton />,
  },
  {
    location: 'changelog',
    title: t('screens.changelog'),
  },
  {
    location: '+not-found',
    title: 'Oops!',
    headerLeft: <HeaderSidebarBackButton />,
    headerRight: <ProfileThemeToggle />,
  },
]
