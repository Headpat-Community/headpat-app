import { Tabs } from 'expo-router'
import { MapIcon, PersonStandingIcon, UsersIcon } from 'lucide-react-native'
import { ProfileThemeToggle } from '~/components/ThemeToggle'
import { HeaderSidebarBackButton } from '~/components/data/DrawerScreensData'
import { useColorScheme } from '~/lib/useColorScheme'

export default function TabsLayout() {
  const { isDarkColorScheme } = useColorScheme()
  const theme = isDarkColorScheme ? 'white' : 'black'

  return (
    <Tabs backBehavior={'history'}>
      <Tabs.Screen
        name="mutuals"
        options={{
          title: 'Mutuals',
          tabBarIcon({ color, size }) {
            return <PersonStandingIcon color={color} size={size} />
          },
          headerLeft: () => <HeaderSidebarBackButton />,
          headerRight: () => <ProfileThemeToggle />,
        }}
      />
      <Tabs.Screen
        name="followers"
        options={{
          title: 'Followers',
          tabBarIcon({ color, size }) {
            return <MapIcon color={color} size={size} />
          },
          headerLeft: () => <HeaderSidebarBackButton />,
          headerRight: () => <ProfileThemeToggle />,
        }}
      />
      <Tabs.Screen
        name="following"
        options={{
          title: 'Following',
          tabBarIcon({ color, size }) {
            return <UsersIcon color={color} size={size} />
          },
          headerLeft: () => <HeaderSidebarBackButton />,
          headerRight: () => <ProfileThemeToggle />,
        }}
      />
    </Tabs>
  )
}
