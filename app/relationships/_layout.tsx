import { Tabs } from 'expo-router'
import { MapIcon, PersonStandingIcon, UsersIcon } from 'lucide-react-native'
import { ProfileThemeToggle } from '~/components/ThemeToggle'
import { HeaderSidebarBackButton } from '~/components/data/DrawerScreensData'

export default function TabsLayout() {
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
